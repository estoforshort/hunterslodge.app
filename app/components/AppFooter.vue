<template>
  <UFooter>
    <template #left>
      Created with <UIcon name="i-bi-heart" /> by
      <NuxtLink to="https://www.patreon.com/estoforshort" target="_blank">
        EstoForShort
      </NuxtLink>
    </template>

    <template #right>
      <UColorModeButton />

      <UButton
        icon="i-simple-icons-discord"
        color="gray"
        variant="ghost"
        to="https://discord.gg/QYNsXnMMnA"
        target="_blank"
      />

      <UButton
        icon="i-simple-icons-github"
        color="gray"
        variant="ghost"
        to="https://github.com/estoforshort/hunterslodge.app"
        target="_blank"
      />
    </template>
  </UFooter>
</template>
