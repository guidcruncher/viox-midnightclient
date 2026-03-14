<template>
  <div class="w-full min-h-screen text-gray-200">
    <Loading v-if="isLoading" />
    <div v-else>
      <!-- HERO -->
      <header class="relative h-72 overflow-hidden rounded-b-2xl border-b border-white/5">
        <img
          :src="artist.image"
          class="absolute inset-0 w-full h-full object-cover opacity-30 blur-xl"
        />

        <div class="relative z-10 flex items-end h-full px-10 pb-8">
          <img
            :src="artist.image"
            class="w-40 h-40 rounded-xl shadow-2xl object-cover border border-white/10"
          />

          <div class="ml-8">
            <h1 class="text-5xl font-semibold mt-1">{{ artist.name }}</h1>
            <p class="text-gray-400 mt-2">{{ artist.bio?.genre }}</p>

            <div class="flex items-center gap-4 mt-5">
              <button
                class="px-6 py-2 rounded-full bg-white text-black font-semibold shadow hover:bg-gray-200 transition"
              >
                Play
              </button>

              <button
                class="px-6 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition"
              >
                Shuffle
              </button>

              <button class="text-gray-300 hover:text-white transition">Follow</button>
            </div>
          </div>
        </div>
      </header>

      <!-- POPULAR TRACKS -->
      <section class="px-10 mt-10">
        <h2 class="text-2xl font-semibold mb-4">Popular</h2>

        <div class="space-y-2">
          <div
            v-for="(track, i) in popular"
            :key="track.uri"
            class="group flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition"
          >
            <div class="flex items-center gap-4">
              <span class="text-gray-500 group-hover:hidden">{{ i + 1 }}</span>
              <button
                @click.end="playItem(track)"
                class="group-hover:block text-gray-200 hover:text-white"
              >
                <LucideIcon name="Play" :size="20" />
              </button>

              <div>
                <p class="font-medium">{{ track.title }}</p>
                <p class="text-sm text-gray-400">{{ track.subtitle }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ALBUMS -->
      <section class="px-10 mt-12">
        <h2 class="text-2xl font-semibold mb-4">Albums</h2>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          <div v-for="album in albums" :key="album.id" class="group">
            <component @click.end="playItem(album)">
              <img
                :src="album.img"
                class="rounded-xl border border-white/5 shadow group-hover:shadow-xl group-hover:scale-105 transition"
              />

              <p class="mt-2 font-medium">{{ album.title }}</p>
              <p class="text-sm text-gray-400">{{ album.subtitle }}</p>
            </component>
          </div>
        </div>
      </section>

      <!-- ABOUT -->
      <section class="px-10 mt-12 pb-20">
        <h2 class="text-2xl font-semibold mb-4">About</h2>

        <p class="max-w-2xl text-gray-300 leading-relaxed">
          {{ artist.bio?.biography }}
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { artistsClient } from "../api/artists"
import Loading from "../components/Loading.vue"
import { useRoute } from "vue-router"
import { usePlayer } from "../composables/usePlayer"
import LucideIcon from "../components/LucideIcon.vue"

const route = useRoute()
const { playItem } = usePlayer()

const isLoading = ref(true)
const artist = ref<any>({
  name: "",
  image: "/img/default_artist.avif",
  listeners: 0,
  bio: "",
})

const popular = ref<any[]>([])

const albums = ref<any[]>([])

onMounted(async () => {
  const raw = route.params.id
  const id = Array.isArray(raw) ? raw[0] : (raw ?? "")

  try {
    const artistRes = await artistsClient.getArtist(id)
    artist.value = {
      name: artistRes.name,
      image: artistRes.images ? artistRes.images[0].url : "/img/default_artist.avif",
      listeners: 0,
      bio: artistRes.bio ?? undefined,
    }
    const popularRes = await artistsClient.getArtistTopTracks(id, "US")
    popular.value = popularRes

    const albumsRes = await artistsClient.getArtistAlbums(id, { limit: 10 })
    albums.value = albumsRes
  } finally {
    isLoading.value = false
  }
})
</script>
