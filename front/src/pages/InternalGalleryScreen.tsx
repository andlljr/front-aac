import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Grid,
  GridLegacy,
  Card,
  CardActionArea,
  CardMedia,
  Typography,
  Alert,
  Button,
} from "@mui/material";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { API_URL } from "../../config";
import { useAuth } from "../context/AuthContext";

interface AlbumSummary {
  folder_name: string;
  image_url: string;
}

export default function InternalGalleryPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { authFetch, token } = useAuth();

  const [albums, setAlbums] = useState<AlbumSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlbums = useCallback(async () => {
    if (!token) {
      navigate("/auth");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`${API_URL}/albums`, { method: "GET" });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data: AlbumSummary[] = await res.json();
      setAlbums(data);
    } catch (err: any) {
      console.error("Erro ao buscar álbuns:", err);
      setError(err?.message ?? "Falha ao carregar álbuns.");
    } finally {
      setLoading(false);
    }
  }, [token, authFetch, navigate]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const handleImagePress = (album: AlbumSummary) => {
    navigate(`/pictograms/${album.folder_name}`, {
      state: { imageUrl: album.image_url },
    });
  };

  if (loading) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        bgcolor="#f5f5f5"
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
        bgcolor="#f5f5f5"
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Caso não tenha álbuns
  if (!albums.length) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        bgcolor="#f5f5f5"
        gap={2}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          GALERIA DE ÁLBUNS
        </Typography>
        <Typography color="text.secondary">
          Nenhum álbum encontrado.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/")}
        >
          Voltar para Início
        </Button>
      </Box>
    );
  }

  // Caso tenha álbuns
  return (
    <Box bgcolor="#f5f5f5" minHeight="100vh" py={4} px={2}>
      {/* Botão de voltar */}
      <Box display="flex" justifyContent="flex-start" mb={2}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
        >
          Voltar para Início
        </Button>
      </Box>

      <Typography
        variant="h5"
        fontWeight="bold"
        align="center"
        gutterBottom
        color="primary"
      >
        GALERIA DE ÁLBUNS
      </Typography>

      <Grid container spacing={2} mt={1}>
        {albums.map((album) => (
          <GridLegacy item xs={12} sm={6} md={4} key={album.folder_name}>
            <Card
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: 3,
                position: "relative",
              }}
            >
              <CardActionArea onClick={() => handleImagePress(album)}>
                <CardMedia
                  component="img"
                  image={album.image_url}
                  alt="album"
                  sx={{ height: 200, objectFit: "cover" }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: "rgba(0,0,0,0.3)",
                    display: "flex",
                    justifyContent: "center",
                    py: 1,
                  }}
                >
                  <TouchAppIcon sx={{ color: "white" }} />
                </Box>
              </CardActionArea>
            </Card>
          </GridLegacy>
        ))}
      </Grid>
    </Box>
  );
}