import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/flows/admin-client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    if (!conversationId) {
      return NextResponse.json({ error: "Missing conversation ID" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Resolve user's account_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("account_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError || !profile?.account_id) {
      return NextResponse.json({ error: "Account not found" }, { status: 400 });
    }

    // Perform unread_count reset using service role client to ensure RLS (e.g. viewer role restriction)
    // does not block resetting unread counts for inbox conversations.
    const { error: updateError } = await supabaseAdmin()
      .from("conversations")
      .update({ unread_count: 0 })
      .eq("id", conversationId)
      .eq("account_id", profile.account_id);

    if (updateError) {
      console.error("[api/conversations/read] update error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/conversations/read] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
