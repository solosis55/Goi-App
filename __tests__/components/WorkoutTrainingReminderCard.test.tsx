import { fireEvent, render } from "@testing-library/react-native";
import { WorkoutTrainingReminderCard } from "../../components/workouts/WorkoutTrainingReminderCard";
import { DEFAULT_WORKOUT_REMINDER } from "../../utils/localNotifications";

const mockSetEnabled = jest.fn();
const mockSetSchedule = jest.fn();

jest.mock("../../hooks/useWorkoutTrainingReminder", () => ({
  formatWorkoutReminderSummary: jest.fn(() => "Desactivado"),
  useWorkoutTrainingReminder: jest.fn(),
}));

import { useWorkoutTrainingReminder } from "../../hooks/useWorkoutTrainingReminder";

const useReminderMock = useWorkoutTrainingReminder as jest.MockedFunction<typeof useWorkoutTrainingReminder>;

describe("<WorkoutTrainingReminderCard />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useReminderMock.mockReturnValue({
      prefs: { ...DEFAULT_WORKOUT_REMINDER },
      loading: false,
      saving: false,
      error: null,
      unsupported: false,
      setEnabled: mockSetEnabled,
      setSchedule: mockSetSchedule,
      openSettings: jest.fn(),
      clearError: jest.fn(),
    });
  });

  it("muestra el recordatorio desactivado por defecto", () => {
    const { getByText, queryByText } = render(<WorkoutTrainingReminderCard />);

    expect(getByText("Recordatorio de entreno")).toBeTruthy();
    expect(getByText(/Desactivado/)).toBeTruthy();
    expect(queryByText("Día")).toBeNull();
  });

  it("muestra chips de día y hora cuando está activado", () => {
    useReminderMock.mockReturnValue({
      prefs: { ...DEFAULT_WORKOUT_REMINDER, enabled: true, weekday: 2, hour: 18 },
      loading: false,
      saving: false,
      error: null,
      unsupported: false,
      setEnabled: mockSetEnabled,
      setSchedule: mockSetSchedule,
      openSettings: jest.fn(),
      clearError: jest.fn(),
    });

    const { getByText } = render(<WorkoutTrainingReminderCard />);

    expect(getByText("Día")).toBeTruthy();
    expect(getByText("Hora")).toBeTruthy();
    expect(getByText("Lun")).toBeTruthy();
    expect(getByText("18:00")).toBeTruthy();
  });

  it("llama setEnabled al activar el switch", () => {
    const { getByLabelText } = render(<WorkoutTrainingReminderCard />);

    fireEvent(getByLabelText("Activar recordatorio semanal de entreno"), "valueChange", true);

    expect(mockSetEnabled).toHaveBeenCalledWith(true);
  });

  it("muestra mensaje de error con enlace a ajustes", () => {
    useReminderMock.mockReturnValue({
      prefs: { ...DEFAULT_WORKOUT_REMINDER },
      loading: false,
      saving: false,
      error: "Activa las notificaciones para Goi en Ajustes del dispositivo.",
      unsupported: false,
      setEnabled: mockSetEnabled,
      setSchedule: mockSetSchedule,
      openSettings: jest.fn(),
      clearError: jest.fn(),
    });

    const { getByText } = render(<WorkoutTrainingReminderCard />);

    expect(getByText("Activa las notificaciones para Goi en Ajustes del dispositivo.")).toBeTruthy();
    expect(getByText("Ajustes")).toBeTruthy();
  });
});
