export const getColorStatus = (status: string) => {
  switch (status) {
    case "Recebida":
      return {
        color: "black",
        backgroundColor: "#3366cc",
        padding: "4px 8px",
        borderRadius: "4px"
      }
    case "Em análise":
      return {
        color: "black",
        backgroundColor: "#FF9900",
        padding: "4px 8px",
        borderRadius: "4px"
      }
    case "Em conformidade":
      return {
        color: "black",
        backgroundColor: "#109618",
        padding: "4px 8px",
        borderRadius: "4px"
      }
    case "Não conformidade":
      return {
        color: "black",
        backgroundColor: "#DC3912",
        padding: "4px 8px",
        borderRadius: "4px"
      }
    case "Não enviada":
      return {
        color: "black",
        backgroundColor: "#808080",
        padding: "4px 8px",
        borderRadius: "4px"
      }
    case "Total":
      return {
        color: "black",
        backgroundColor: "#000000",
        padding: "4px 8px",
        borderRadius: "4px"
      }
    default:
      return {}
  }
}
