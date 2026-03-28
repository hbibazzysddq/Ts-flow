import supabase from "./Supabase";

export interface Column {
  id: string;
  board_id: string;
  title: string;
  order: number;
}

export const getColumns = async (board_id: string) => {
  const { data, error } = await supabase
    .from("columns")
    .select("*")
    .eq("board_id", board_id);

  return { data, error };
};

export const createColumns = async (
  board_id: string,
  title: string,
  order: number,
) => {
  const { data, error } = await supabase
    .from("columns")
    .insert({ board_id: board_id, title, order })
    .select()
    .single();

  return { data, error };
};

export const deleteColumns = async (id: string) => {
  const { error } = await supabase.from("columns").delete().eq("id", id);
  return { error };
};
