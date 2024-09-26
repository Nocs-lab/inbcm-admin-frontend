export const getColorStatus = (status: string) => {
  switch (status) {
    case "Recebida":
      return {
        color: "black",
        backgroundColor: "#a8f2ff",
        padding: "4px 8px",
        borderRadius: "4px",
      };
    case "Em análise":
      return {
        color: "black",
        backgroundColor: "#ffe396",
        padding: "4px 8px",
        borderRadius: "4px",
      };
    case "Em conformidade":
      return {
        color: "black",
        backgroundColor: "#b7f5bd",
        padding: "4px 8px",
        borderRadius: "4px",
      };
    case "Não conformidade":
      return {
        color: "black",
        backgroundColor: "#fbbaa7",
        padding: "4px 8px",
        borderRadius: "4px",
      };
    default:
      return {};
  }
};
