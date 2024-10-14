<script lang="ts">
  import type { PageData } from "./$types";
  export let data: PageData;

  import { useMutation } from "@sveltestack/svelte-query";
  import { Octokit } from "octokit";
  import { toast } from "svelte-sonner";
  import { Input } from "$lib/components/ui/input";
  import * as Form from "$lib/components/ui/form";
  import * as Table from "$lib/components/ui/table";

  import { superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { formSchema, type FormSchema } from "./schema";

  const octokit = new Octokit();
  type Args = {
    author: string;
  };
  const mut = useMutation((args: Args) => {
    return octokit.rest.search.issuesAndPullRequests({
      q: `is:pr author:${args.author} archived:false`,
    });
  });

  const form = superForm(data.form, {
    validators: zodClient(formSchema),
    dataType: "json",
    onUpdated: ({ form: f }: { form: any }) => {
      console.log(f);
      if (f.valid) {
        $mut.mutate({
          author: f.data.username,
        });
        toast.success(`You submitted ${JSON.stringify(f.data, null, 2)}`);
      } else {
        toast.error("Please fix the errors in the form.");
      }
    },
  });
  const { form: formData, enhance } = form;
</script>

<svelte:head>
  <title>Home</title>
  <meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
  <form method="POST" use:enhance>
    <Form.Field {form} name="username">
      <Form.Control let:attrs>
        <Form.Label>Username</Form.Label>
        <Input {...attrs} bind:value={$formData.username} />
      </Form.Control>
      <Form.Description>This is your public display name.</Form.Description>
      <Form.FieldErrors />
    </Form.Field>
    <Form.Button>Submit</Form.Button>
  </form>
  {#if $mut.isLoading}
    <p>loading...</p>
  {/if}
  {#if $mut.isSuccess}
    {#if data.flag}
      <pre>
			{JSON.stringify(
          $mut.data?.data.items
            .filter((item) => {
              return (
                item.author_association != "OWNER" &&
                item.pull_request?.merged_at != null &&
                item.state == "closed" &&
                !item.title.includes("chore")
              );
            })
            .map((item) => {
              return {
                title: item.title,
                url: item.html_url,
                merged_at: item.pull_request?.merged_at,
                author_association: item.author_association,
              };
            }),
          null,
          2,
        )}
			
		</pre>
    {:else}
      <Table.Root>
        <Table.Caption>A list of your recent invoices.</Table.Caption>
        <Table.Header>
          <Table.Row>
            <Table.Head class="w-[200px]">Repo</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head>Pull Request title</Table.Head>
            <Table.Head class="text-right">Merged at?</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each $mut.data?.data.items
            .filter((item) => {
              return item.author_association != "OWNER" && item.pull_request?.merged_at != null && item.state == "closed" && !item.title.includes("chore");
            })
            .map((item) => {
              console.log(item);
              return { title: item.title, url: item.html_url, state: item.state, merged_at: item.pull_request?.merged_at, author_association: item.author_association, repo: item.pull_request.html_url
                  .split("/")
                  .slice(3, 5)
                  .join("/"), repo_url: item.pull_request.html_url
                  .split("/")
                  .slice(0, 5)
                  .join("/") };
            }) as item}
            <Table.Row>
              <Table.Cell class="font-medium">
                <a href={item.repo_url}>{item.repo}</a>
              </Table.Cell>
              <Table.Cell>{item.state}</Table.Cell>
              <Table.Cell>
                <a href={item.url}>{item.title}</a>
              </Table.Cell>
              <Table.Cell class="text-right">{item.merged_at}</Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    {/if}
  {/if}
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 0.6;
  }
</style>
