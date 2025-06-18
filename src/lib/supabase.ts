import { createClient } from "@supabase/supabase-js";
import { Bucket } from "~/server/bucket";

export const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const uploadFileToSignedUrl = async ({
    file,
    path,
    token,
    bucket
}: {
    file: File,
    path: string,
    token: string,
    bucket: Bucket
}) => {
    try {
        const { data, error } = await supabaseClient.storage.from(bucket).uploadToSignedUrl(path, token, file)
        if (error) throw error
        if (!data) throw new Error("No Data Returned from uploadToSignedUrl")
        const fileUrl = supabaseClient.storage.from(bucket).getPublicUrl(data.path)

        return fileUrl.data.publicUrl

    } catch (error) {
        throw error
    }
}