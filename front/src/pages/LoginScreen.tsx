import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../../config";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Tabs,
  Tab,
  Paper,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Link,
} from "@mui/material";

export default function AuthPage(): React.JSX.Element {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [accepted, setAccepted] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/");
    } catch (err: any) {
      setError(err?.message ?? "Falha no login.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erro no registro.");
      }

      alert("Usuário registrado com sucesso! Faça login.");
      setTab("login");
    } catch (err: any) {
      setError(err?.message ?? "Falha no registro.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === "login") handleLogin();
    else handleRegister();
  };

  // ---------- Tela de introdução ----------
  if (showIntro) {
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 999,
          overflowY: "auto",
          p: 2,
        }}
      >
        <Paper
          elevation={10}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            width: "100%",
            maxWidth: 600,
            borderRadius: 4,
            textAlign: "center",
            backgroundColor: "rgba(255,255,255,0.95)",
          }}
        >
          <Typography
            variant="h4"
            color="primary.main"
            fontWeight="bold"
            gutterBottom
          >
            Bem-vindo(a) ao Pictomagia
          </Typography>

          <Typography variant="body1" sx={{ mb: 2 }}>
            A plataforma é um recurso complementar às metodologias de Comunicação
            Aumentativa e Alternativa, como o PECS e as pranchas adaptadas, tornando
            a terapia mais envolvente por meio da criação de{" "}
            <strong>histórias infantis com pictogramas</strong>.
          </Typography>

          <Typography variant="body2" align="left" sx={{ mb: 2 }}>
            <strong>Como funciona:</strong>
            <br />
            1️⃣ O(a) terapeuta faz o upload de uma imagem ou desenho de interesse da
            criança.
            <br />
            2️⃣ A IA gera automaticamente uma história curta ilustrada com pictogramas.
            <br />
            3️⃣ A criança interage com as palavras e amplia o vocabulário de forma
            lúdica e espontânea.
          </Typography>

          <Typography variant="body2" sx={{ mb: 2 }}>
            Após testar a plataforma, pedimos que responda o breve formulário de
            validação:
          </Typography>

          <Link
            href="https://forms.gle/5DigP8ADC9hNPsC76"
            target="_blank"
            rel="noopener"
            sx={{
              display: "block",
              mb: 2,
              wordBreak: "break-word",
              fontWeight: 500,
            }}
          >
            🔗 Formulário de validação
          </Link>

          <FormControlLabel
            control={
              <Checkbox
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
            }
            label="Li e aceito as instruções de uso"
            sx={{
              alignItems: "flex-start",
              textAlign: "left",
              mx: "auto",
              maxWidth: 300,
            }}
          />

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={!accepted}
              onClick={() => setShowIntro(false)}
              sx={{
                py: 1.2,
                fontSize: { xs: "0.9rem", sm: "1rem" },
              }}
            >
              Continuar para o Login
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  // ---------- Tela de login/registro ----------
  return (
    <Container
      maxWidth="sm"
      sx={{
        px: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            width: "100%",
            maxWidth: 500,
          }}
        >
          <Typography
            variant="h4"
            align="center"
            fontWeight="bold"
            color="primary.main"
            gutterBottom
          >
            Pictomagia
          </Typography>

          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            centered
            textColor="primary"
            indicatorColor="primary"
            sx={{ mb: 3 }}
          >
            <Tab label="Login" value="login" />
            <Tab label="Registrar" value="register" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={onSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <TextField
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 2, py: 1.5 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : tab === "login" ? (
                "Entrar"
              ) : (
                "Registrar"
              )}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
