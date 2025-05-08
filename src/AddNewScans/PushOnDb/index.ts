import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const supabaseUrl = "https://ajtyenefvkagyajggfrv.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const data = () => {
  const filePath = path.resolve(__dirname, "../../chapters.json");

  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
};

async function fetchData() {
  try {
    const chapters = await data(); // Récupère les données du fichier

    // Si chapters est un tableau d'objets, chaque objet doit correspondre aux colonnes de la table OnePiece
    const { data: any, error } = await supabase
      .from("OnePiece")
      .insert(chapters)
      .select();

    if (error) {
      console.error("Error inserting data:", error);
    } else {
      console.log("Data inserted successfully:", data);
    }
  } catch (error) {
    console.error("Error in fetchData:", error);
  }
}

fetchData();
