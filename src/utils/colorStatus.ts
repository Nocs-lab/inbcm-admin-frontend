export const getColorStatus = (status: string) => {
  switch (status) {
    case "Recebida":
      return {
        color: "white",
        backgroundColor: "#071d41",
        padding: "4px 8px",
        borderRadius: "4px",
      };
    case "Em análise":
      return {
        color: "white",
        backgroundColor: "#C2BA0F",
        padding: "4px 8px",
        borderRadius: "4px",
      };
    case "Em conformidade":
      return {
        color: "white",
        backgroundColor: "#118316",
        padding: "4px 8px",
        borderRadius: "4px",
      };
    case "Não conformidade":
      return {
        color: "white",
        backgroundColor: "#D11111",
        padding: "4px 8px",
        borderRadius: "4px",
      };
    default:
      return {};
  }
};
