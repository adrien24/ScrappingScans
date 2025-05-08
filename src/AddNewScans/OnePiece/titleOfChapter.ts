import axios from "axios";

export const titleOfChapter = async (numberOfChapter: number) => {
  try {
    const url = `https://api.api-onepiece.com/v2/chapters/fr/${numberOfChapter}`;
    const response = await axios.get(url);
    const data = response.data;
    return { title: data.title, description: data.description };
  } catch {
    return { title: "Nom à venir", description: "Description à venir" };
  }
};
