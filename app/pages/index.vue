<script setup lang="ts">
const { data } = await useFetch('/api/hello')
</script>

<template>
  <h1>{{ data.message }}</h1>
</template>
