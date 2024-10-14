<script>
  import { Toaster } from "$lib/components/ui/sonner";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import "../app.css";
  import Header from "./Header.svelte";

  import { mountVercelToolbar } from "@vercel/toolbar/vite";
  import { onMount } from "svelte";

  onMount(() => mountVercelToolbar());
  const queryClient = new QueryClient();
</script>

<div class="app">
  <Header></Header>

  <main>
    <Toaster />
    <QueryClientProvider client={queryClient}>
      <slot></slot>
    </QueryClientProvider>
  </main>

  <footer>
    <p>
      made with <a href="https://kit.svelte.dev">SvelteKit</a>, hosted on
      <a href="https://vercel.com">Vercel</a>
    </p>
  </footer>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    width: 100%;
    max-width: 64rem;
    margin: 0 auto;
    box-sizing: border-box;
  }

  footer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 12px;
  }

  footer a {
    font-weight: bold;
  }

  @media (min-width: 480px) {
    footer {
      padding: 12px 0;
    }
  }
</style>
