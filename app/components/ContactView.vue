<script setup lang="ts">
const config = useRuntimeConfig()
const hasFormKey = computed(() => Boolean(config.public.web3formsKey))

const form = reactive({ name: '', email: '', message: '' })
const status = ref<'idle' | 'sending' | 'sent' | 'error'>('idle')

async function submit() {
  status.value = 'sending'
  try {
    const res = await $fetch<{ success: boolean }>('https://api.web3forms.com/submit', {
      method: 'POST',
      body: {
        access_key: config.public.web3formsKey,
        subject: 'New message from portfolio site',
        from_name: form.name,
        ...form,
      },
    })
    status.value = res.success ? 'sent' : 'error'
  } catch {
    status.value = 'error'
  }
}
</script>

<template>
  <div class="grid gap-6 sm:grid-cols-2">
    <div class="space-y-3 text-sm">
      <a
        href="mailto:filipemolina@live.com"
        class="flex items-center gap-2 text-term-fg/90 transition hover:text-term-accent"
      >
        <span class="text-term-accent">→</span> filipemolina@live.com
      </a>
      <a
        href="https://linkedin.com/in/filipemolina15"
        target="_blank"
        rel="noopener"
        class="flex items-center gap-2 text-term-fg/90 transition hover:text-term-accent"
      >
        <span class="text-term-accent">→</span> linkedin.com/in/filipemolina15
      </a>
      <a
        href="https://github.com/filipemolina"
        target="_blank"
        rel="noopener"
        class="flex items-center gap-2 text-term-fg/90 transition hover:text-term-accent"
      >
        <span class="text-term-accent">→</span> github.com/filipemolina
      </a>

      <p class="pt-2 text-xs text-term-muted">
        Open to freelance contracts and full-time roles. Based in Winnipeg, MB — remote-friendly.
      </p>
    </div>

    <form
      v-if="hasFormKey"
      class="space-y-3"
      @submit.prevent="submit"
    >
      <input
        v-model="form.name"
        required
        type="text"
        placeholder="name"
        class="w-full rounded border border-term-border bg-term-bg px-3 py-2 text-sm text-term-fg placeholder:text-term-muted focus:border-term-accent focus:outline-none"
      >
      <input
        v-model="form.email"
        required
        type="email"
        placeholder="email"
        class="w-full rounded border border-term-border bg-term-bg px-3 py-2 text-sm text-term-fg placeholder:text-term-muted focus:border-term-accent focus:outline-none"
      >
      <textarea
        v-model="form.message"
        required
        rows="4"
        placeholder="message"
        class="w-full rounded border border-term-border bg-term-bg px-3 py-2 text-sm text-term-fg placeholder:text-term-muted focus:border-term-accent focus:outline-none"
      />
      <button
        type="submit"
        :disabled="status === 'sending'"
        class="rounded-md bg-term-accent px-5 py-2 text-sm font-semibold text-term-bg transition hover:brightness-110 disabled:opacity-60"
      >
        {{ status === 'sending' ? 'Sending…' : 'Send' }}
      </button>
      <p v-if="status === 'sent'" class="text-xs text-term-accent">Message sent — thanks!</p>
      <p v-if="status === 'error'" class="text-xs text-term-danger">
        Something went wrong — email me directly instead.
      </p>
    </form>
  </div>
</template>
