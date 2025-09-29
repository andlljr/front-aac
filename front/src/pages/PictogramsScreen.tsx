import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import {
  Box,
  CircularProgress,
  GridLegacy,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  Button,
  Paper,
  Alert,
  Stack,
  Typography,
  IconButton,
} from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";

import { API_URL } from "../../config";
import { useAuth } from "../context/AuthContext";

interface PictogramResponse {
  story: string[];
  pictograms: string[][]; // cada história tem uma lista de pictogramas
  image_url: string;
}

export default function PictogramsScreen(): React.JSX.Element {
  const { folderName } = useParams<{ folderName: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, authFetch } = useAuth();

  const state = location.state as { imageUrl?: string } | undefined;

  const [mainImage, setMainImage] = useState<string | null>(
    state?.imageUrl ?? null
  );
  const [stories, setStories] = useState<string[]>([]);
  const [pictogramsByStory, setPictogramsByStory] = useState<string[][]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/auth");
      return;
    }
    if (!folderName) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await authFetch(`${API_URL}/albums/${folderName}`, {
          method: "GET",
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data: PictogramResponse = await res.json();

        if (!mainImage && data.image_url) setMainImage(data.image_url);
        setStories(data.story || []);
        setPictogramsByStory(data.pictograms || []);
      } catch (err: any) {
        console.error("Erro ao buscar álbum:", err);
        setError(err?.message ?? "Falha ao carregar álbum.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [folderName, token, authFetch, mainImage, navigate]);

  const handlePictogramClick = (url: string) => {
    setSelected((prev) => [...prev, url]);

    if (audioEnabled) {
      const fileName = url.substring(url.lastIndexOf("/") + 1).split(".")[0];
      const word = decodeURIComponent(fileName); // decodifica acentos

      // 🔧 cancela qualquer fala anterior antes de iniciar a nova
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "pt-BR";
      utterance.pitch = 1.0;
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRemoveFromSelected = (index: number) => {
    setSelected((prev) => prev.filter((_, i) => i !== index));
  };

  const clearSelected = () => setSelected([]);

  if (loading) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box bgcolor="#f5f5f5" minHeight="100vh" px={2} py={2}>
      {/* Topo: voltar e áudio */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={() => navigate(-1)} // 🔙 volta para a página anterior
        >
          Voltar
        </Button>

        <IconButton onClick={() => setAudioEnabled((prev) => !prev)} size="small">
          {audioEnabled ? (
            <VolumeUpIcon color="primary" />
          ) : (
            <VolumeOffIcon color="disabled" />
          )}
        </IconButton>
      </Box>

      {/* Imagem principal */}
      {mainImage && (
        <Paper
          sx={{
            maxWidth: 600,
            mx: "auto",
            mb: 4,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <CardMedia
            component="img"
            image={mainImage}
            alt="Imagem principal"
            sx={{ objectFit: "contain", maxHeight: 300 }}
          />
        </Paper>
      )}

      {/* Frase montada */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Stack direction="row" flexWrap="wrap" spacing={1} mb={2}>
          {selected.map((src, idx) => (
            <Card
              key={idx}
              sx={{ width: 50, height: 50, borderRadius: 1, cursor: "pointer" }}
              onClick={() => handleRemoveFromSelected(idx)}
            >
              <CardMedia
                component="img"
                image={src}
                alt={`Selecionado ${idx}`}
                sx={{ objectFit: "contain" }}
              />
            </Card>
          ))}
        </Stack>

        <Button variant="contained" color="error" onClick={clearSelected}>
          Limpar Frase
        </Button>
      </Paper>

      {/* Histórias + pictogramas */}
      {stories.map((story, idx) => (
        <Box key={idx} mb={4}>
          <Typography variant="h6" gutterBottom>
            {story}
          </Typography>
          <Grid container spacing={2}>
            {(pictogramsByStory[idx] || []).map((url) => (
              <GridLegacy item key={url}>
                <Card
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 1,
                    boxShadow: 2,
                  }}
                >
                  <CardActionArea onClick={() => handlePictogramClick(url)}>
                    <CardMedia
                      component="img"
                      image={url}
                      alt="pictograma"
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </CardActionArea>
                </Card>
              </GridLegacy>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
}