import { fireEvent, render } from "@testing-library/react-native";
import { SocialSectionEmpty } from "../../components/social/SocialSectionEmpty";

describe("<SocialSectionEmpty />", () => {
  it("muestra título y cuerpo cuando la sección está vacía", () => {
    const { getByText } = render(
      <SocialSectionEmpty title="Nadie cerca aún" body="Activa tu ubicación para ver atletas en un radio de 50 km." />
    );

    expect(getByText("Nadie cerca aún")).toBeTruthy();
    expect(getByText("Activa tu ubicación para ver atletas en un radio de 50 km.")).toBeTruthy();
  });

  it("no muestra botón si falta actionLabel u onAction", () => {
    const { queryByRole } = render(<SocialSectionEmpty title="Vacío" body="Sin sugerencias." />);

    expect(queryByRole("button")).toBeNull();
  });

  it("ejecuta onAction al pulsar el botón de acción", () => {
    const onAction = jest.fn();
    const { getByRole } = render(
      <SocialSectionEmpty
        title="Sin seguidores"
        body="Explora atletas en Descubrir."
        actionLabel="Ir a Descubrir"
        onAction={onAction}
      />
    );

    fireEvent.press(getByRole("button", { name: "Ir a Descubrir" }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
