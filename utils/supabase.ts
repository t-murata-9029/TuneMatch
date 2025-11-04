'use client'

import { supabase } from "@/lib/supabase.cliant"

export function getUser(){
    return supabase.auth.getUser();
}