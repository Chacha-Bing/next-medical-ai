import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname.startsWith("/login");

  // 如果未登录且不在登录页，重定向到登录页
  if (!isLoggedIn && !isLoginPage) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }
  
  // 如果已登录还想去登录页，重定向到首页
  if (isLoggedIn && isLoginPage) {
    return Response.redirect(new URL("/", req.nextUrl));
  }
});

// 配置中间件匹配哪些路径（排除静态文件、图片等）
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};