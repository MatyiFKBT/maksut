<script lang="ts">
	import { useMutation } from "@sveltestack/svelte-query";
	import { Octokit } from "octokit";
	import { toast } from "svelte-sonner";
	import { Input } from "$lib/components/ui/input";
	import * as Form from "$lib/components/ui/form";
	import {
		type SuperValidated,
		type Infer,
		superForm,
	} from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { formSchema, type FormSchema } from "./schema";
	export let data: SuperValidated<Infer<FormSchema>>;

	const octokit = new Octokit();
	type Args = {
		author: string;
	};
	const mut = useMutation((args: Args) => {
		return octokit.rest.search.issuesAndPullRequests({
			q: `is:pr author:${args.author} archived:false`,
		});
	});

	const form = superForm(data, {
		validators: zodClient(formSchema),
		dataType: 'json',
		onUpdated: ({ form: f }: {form:any}) => {
			console.log(f)
			if (f.valid) {
				$mut.mutate({
					author: f.data.username
				})
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
			<Form.Description
				>This is your public display name.</Form.Description
			>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Button>Submit</Form.Button>
	</form>
	{#if $mut.isLoading}
		<p>loading...</p>
	{/if}
	{#if $mut.isSuccess}
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
