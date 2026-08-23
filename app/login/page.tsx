import { LoginForm } from "./login-form";

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  return <LoginForm oauthError={firstSearchParam(params.error)} />;
}
