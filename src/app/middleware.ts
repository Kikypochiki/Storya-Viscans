import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next();

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });

            response = NextResponse.next();
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();

    const isMainRoute = request.nextUrl.pathname.startsWith("/main");

    if (isMainRoute && !session) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login"; 
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    console.error("Error in middleware:", error);
  }

  return response;
}

export const config = {
  matcher: ["/main/:path*"],
};
