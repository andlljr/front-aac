import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";
import { useAuth } from "../context/AuthContext";

import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CircularProgress,
  Backdrop,
  Alert,
  Stack,
  Button,
} from "@mui/material";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CollectionsIcon from "@mui/icons-material/Collections";

export default function HomePage(): React.JSX.Element {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files?.[0]) return;
    if (!token) {
      alert("Login necessário!");
      navigate("/login");
      return;
    }

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setError(null);

      const res = await fetch(`${API_URL}/albums`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro no upload: ${text}`);
      }

      const data = await res.json();
      navigate(`/pictograms/${data.id}`, {
        state: { imageUrl: data.image_url },
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Falha ao enviar imagem");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#f9fafb"
      px={2}
    >
      {/* Botão logout no topo direito */}
      <Box position="absolute" top={16} right={16}>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={handleLogout}
        >
          Sair
        </Button>
      </Box>

      <Typography variant="h5" fontWeight="bold" mb={4} color="text.primary">
        Selecione uma opção
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, width: "100%", maxWidth: 360 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={3} width="100%" maxWidth={360}>
        {/* Galeria */}
        <Card>
          <CardActionArea
            component="label"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 4,
            }}
          >
            <PhotoLibraryIcon sx={{ fontSize: 48, color: "primary.main" }} />
            <Typography variant="subtitle1" mt={1}>
              Galeria
            </Typography>
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />
          </CardActionArea>
        </Card>

        {/* Câmera */}
        <Card>
          <CardActionArea
            onClick={() =>
              alert("Captura de câmera não suportada no navegador.")
            }
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 4,
            }}
          >
            <PhotoCameraIcon sx={{ fontSize: 48, color: "primary.main" }} />
            <Typography variant="subtitle1" mt={1}>
              Câmera
            </Typography>
          </CardActionArea>
        </Card>

        {/* Meus Álbuns */}
        <Card>
          <CardActionArea
            onClick={() => navigate("/internal-gallery")}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 4,
            }}
          >
            <CollectionsIcon sx={{ fontSize: 48, color: "primary.main" }} />
            <Typography variant="subtitle1" mt={1}>
              Meus Álbuns
            </Typography>
          </CardActionArea>
        </Card>
      </Stack>

      {/* Loading overlay */}
      <Backdrop open={uploading} sx={{ zIndex: 1300, color: "#fff" }}>
        <CircularProgress color="inherit" />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Processando imagem...
        </Typography>
      </Backdrop>
    </Box>
  );
}