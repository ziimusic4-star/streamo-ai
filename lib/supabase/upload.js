// Uploads happen client-side (browser) straight to Supabase Storage — the
// file itself never passes through a Server Action. Once we have a public
// URL, that URL is what gets saved into the database via a Server Action.
export async function uploadPublicFile(supabase, bucket, file, pathPrefix = "") {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${pathPrefix}${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

