type HubStats = {
  routineCount: number;
  totalSessions: number;
  sessionsThisWeek: number;
};

export function buildWorkoutHubHeroCopy(stats: HubStats): { title: string; body: string } {
  if (stats.routineCount === 0) {
    return {
      title: "Tu zona de entreno",
      body: "Crea tu primera rutina y empieza a registrar cada sesión.",
    };
  }
  if (stats.sessionsThisWeek >= 4) {
    return {
      title: "Buen ritmo",
      body: `${stats.sessionsThisWeek} entrenos esta semana. Sigue así.`,
    };
  }
  if (stats.sessionsThisWeek >= 1) {
    return {
      title: "Semana en marcha",
      body:
        stats.sessionsThisWeek === 1
          ? "1 entreno esta semana. ¿Cuál toca hoy?"
          : `${stats.sessionsThisWeek} entrenos esta semana. Elige tu rutina.`,
    };
  }
  if (stats.totalSessions === 0) {
    return {
      title: "Listo para empezar",
      body: "Tienes rutinas preparadas. Pulsa Entrenar en cualquiera.",
    };
  }
  return {
    title: "Entrenamientos",
    body: "Retoma una rutina o revisa tu historial de sesiones.",
  };
}
