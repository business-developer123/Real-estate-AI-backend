import { supabase } from "../utils/supabase";

export const getData = async (email: string) => {
    const { data, error } = await supabase.from('realhistory').select("*").eq("email", email);
    if (error) return { message: error.message, status: false };
    return { message: "Got all history successfully!", status: true, data };
}

export const saveData = async (data: any) => {
    let getData: any[] = [];
    if (data.type == "listing") {
        const { data: insertedData, error } = await supabase.from('realhistory').insert({
            email: data.email,
            date: new Date(),
            title: data.title,
            lasttitle: data.lastTitle,
            description: data.description,
            results: JSON.stringify(data.results),
            type: data.type
        }).select();
        getData = insertedData ?? [];
        if (error) return { message: error.message, status: false };
    } else {
        const { data: insertedData, error } = await supabase.from('realhistory').insert({
            email: data.email,
            date: new Date(),
            title: data.title,
            lasttitle: data.lastTitle,
            description: data.description,
            type: data.type
        }).select();
        getData = insertedData ?? [];
        if (error) return { message: error.message, status: false };
    }
    return { message: "Saved the data successfully!", status: true, data: getData };
}

export const updateData = async (id: string, data: any) => {
    const { data: updateData, error } = await supabase
        .from('realhistory')
        .update({ date: new Date(), title: data.title, lasttitle: data.lastTitle, description: data.description, results: data.results, type: data.type })
        .eq('id', id).select()

    if (error) return { message: error.message, status: false };
    return { message: "Updated the data successfully!", status: true, data: updateData };
}

export const getOneHistory = async (id: string) => {
    const { data, error } = await supabase.from('realhistory').select("*").eq('id', id).select();
    if (error) return { message: error.message, status: false };
    return { message: "Got a history successfully", data };
}