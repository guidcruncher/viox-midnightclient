<script lang="ts" setup>
</script>
<template>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Viox Toolbar</title>
  
  <!-- Import Inter Font -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Simulate your Tailwind v4 @theme config -->
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            viox: {
              deep: '#2d005f',
              electric: '#8a2be2',
              ice: '#a0dfff',
              lilac: '#c8a2c8',
            }
          },
          fontFamily: {
            display: ['Inter', 'system-ui', 'sans-serif'],
            sans: ['Inter', 'ui-sans-serif', 'sans-serif'],
          },
          boxShadow: {
            'glow-electric': '0 0 20px rgba(138, 43, 226, 0.4)',
          }
        }
      }
    }
  </script>

  <!-- Add your custom layers and scrollbar hiding utility -->
  <style type="text/tailwindcss">
    @layer components {
      .glass {
        @apply bg-viox-deep/80 backdrop-blur-xl border-b border-white/10;
      }
      
      .toolbar-item {
        @apply flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 
               shrink-0 whitespace-nowrap cursor-pointer select-none;
      }

      .toolbar-item-active {
        @apply bg-viox-electric/20 text-viox-ice border border-viox-electric/50 shadow-[0_0_15px_rgba(138,43,226,0.2)];
      }

      .toolbar-item-inactive {
        @apply text-viox-lilac hover:bg-white/10 hover:text-white border border-transparent;
      }
    }

    /* Utility to hide scrollbar but keep functionality */
    @layer utilities {
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .no-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
      }
    }
  </style>
</head>
<body class="bg-[#120024] text-white font-sans min-h-screen overflow-x-hidden">

  <!-- Toolbar Container -->
  <nav class="w-full glass sticky top-0 z-50">
    <!-- 
      overflow-x-auto: Enables horizontal scrolling
      no-scrollbar: Hides the ugly scrollbar track
      flex-nowrap: Forces items to stay on one line 
    -->
    <div class="flex items-center h-16 px-4 md:px-6 overflow-x-auto flex-nowrap gap-2 no-scrollbar">
      
      <!-- Active Item -->
      <button class="toolbar-item toolbar-item-active">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Dashboard
      </button>

      <!-- Inactive Items (many added to demonstrate scrolling) -->
      <button class="toolbar-item toolbar-item-inactive">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        Analytics
      </button>

      <button class="toolbar-item toolbar-item-inactive">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Messages <span class="ml-1 bg-viox-electric text-white text-[10px] px-1.5 py-0.5 rounded-full">3</span>
      </button>

      <!-- Separator line -->
      <div class="w-px h-8 bg-white/10 mx-1 shrink-0"></div>

      <button class="toolbar-item toolbar-item-inactive">
        Projects
      </button>
      
      <button class="toolbar-item toolbar-item-inactive">
        Team Members
      </button>

      <button class="toolbar-item toolbar-item-inactive">
        Integrations
      </button>

      <button class="toolbar-item toolbar-item-inactive">
        Billing & Subscriptions
      </button>

      <button class="toolbar-item toolbar-item-inactive">
        Security
      </button>

      <button class="toolbar-item toolbar-item-inactive">
        API Keys
      </button>

      <button class="toolbar-item toolbar-item-inactive">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        Settings
      </button>

    </div>
  </nav>

  <!-- Dummy Content to show the toolbar context -->
  <main class="p-6 md:p-12 max-w-7xl mx-auto">
    <h1 class="text-3xl font-display font-bold text-viox-ice mb-4">Dashboard Overview</h1>
    <p class="text-viox-lilac">
      Resize your browser window or view this on a mobile device to see the horizontal scrolling in action. Use your trackpad or touch to swipe through the toolbar items!
    </p>
    
    <div class="mt-8 h-64 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center text-white/20">
      Content Area
    </div>
  </main>

</body>
</html>


</template>
