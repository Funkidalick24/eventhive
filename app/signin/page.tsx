import { Suspense } from "react";
import { Container } from "../components/container";
import { SigninClient } from "./signin-client";

export default function SigninPage() {
  return (
    <main className="py-14 md:py-20">
      <Container>
        <Suspense fallback={null}>
          <SigninClient />
        </Suspense>
      </Container>
    </main>
  );
}

