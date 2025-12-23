<template>
  <NuxtLayout>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-4xl font-bold mb-8">How Round-Robin Tournaments Work</h1>

      <!-- Baby-foot Rules -->
      <div class="card mb-8 border-2 border-primary-200">
        <div class="flex items-center mb-4">
          <span class="text-4xl mr-3">⚽</span>
          <h2 class="text-2xl font-semibold">Baby-Foot Rules</h2>
        </div>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div class="text-lg font-bold text-green-900 mb-2">
            🏆 First to 10 Goals Wins!
          </div>
          <p class="text-green-800">
            Each match is played until one team reaches <strong>10 goals</strong>.
            The first team to score 10 goals is declared the winner.
          </p>
        </div>
        <div class="space-y-2 text-gray-700">
          <div class="flex items-start">
            <span class="text-green-600 mr-2">✓</span>
            <div><strong>Maximum score:</strong> 10 goals per team</div>
          </div>
          <div class="flex items-start">
            <span class="text-green-600 mr-2">✓</span>
            <div><strong>Points system:</strong> Win = 3 points, Draw = 1 point (rare), Loss = 0 points</div>
          </div>
          <div class="flex items-start">
            <span class="text-green-600 mr-2">✓</span>
            <div><strong>Visual indicators:</strong> Winner gets a 🏆 trophy next to their name and score in green</div>
          </div>
        </div>
      </div>

      <!-- Introduction -->
      <div class="card mb-8">
        <h2 class="text-2xl font-semibold mb-4">What is Round-Robin?</h2>
        <p class="text-gray-700 mb-4">
          Round-robin is a tournament format where <strong>each team plays against every other team exactly once</strong>.
          This ensures fair competition and gives every team an equal opportunity to compete.
        </p>
        <p class="text-gray-700">
          Unlike elimination tournaments where losing once means you're out, in round-robin tournaments,
          every team plays all their scheduled matches regardless of wins or losses.
        </p>
      </div>

      <!-- Match Calculation -->
      <div class="card mb-8">
        <h2 class="text-2xl font-semibold mb-4">Match Calculation Formula</h2>
        <p class="text-gray-700 mb-4">
          The number of matches in a round-robin tournament is calculated using the formula:
        </p>
        <div class="bg-primary-50 border-2 border-primary-200 rounded-lg p-6 text-center mb-4">
          <div class="text-3xl font-bold text-primary-900 mb-2">
            n × (n - 1) ÷ 2
          </div>
          <div class="text-sm text-primary-700">
            where <strong>n</strong> is the number of teams
          </div>
        </div>
        <p class="text-gray-700">
          For example:
        </p>
        <ul class="list-disc list-inside text-gray-700 space-y-2 mt-3">
          <li><strong>4 teams</strong> → 4 × 3 ÷ 2 = <strong>6 matches</strong></li>
          <li><strong>6 teams</strong> → 6 × 5 ÷ 2 = <strong>15 matches</strong></li>
          <li><strong>8 teams</strong> → 8 × 7 ÷ 2 = <strong>28 matches</strong></li>
        </ul>
      </div>

      <!-- How it works in our system -->
      <div class="card mb-8">
        <h2 class="text-2xl font-semibold mb-4">How it Works in Our System</h2>
        <div class="space-y-6">
          <div class="flex items-start">
            <div class="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl">
              1
            </div>
            <div class="ml-4">
              <h3 class="font-semibold text-lg mb-1">Create a Tournament</h3>
              <p class="text-gray-700">Admins create tournaments with a name, date, and description.</p>
            </div>
          </div>

          <div class="flex items-start">
            <div class="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl">
              2
            </div>
            <div class="ml-4">
              <h3 class="font-semibold text-lg mb-1">Register Teams</h3>
              <p class="text-gray-700">
                Users can join tournaments by creating teams with a partner, or admins can add teams manually.
              </p>
            </div>
          </div>

          <div class="flex items-start">
            <div class="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl">
              3
            </div>
            <div class="ml-4">
              <h3 class="font-semibold text-lg mb-1">Generate Matches</h3>
              <p class="text-gray-700">
                Once all teams are registered, admins click the "Generate Round-Robin Matches" button.
                The system automatically creates all necessary matches.
              </p>
            </div>
          </div>

          <div class="flex items-start">
            <div class="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl">
              4
            </div>
            <div class="ml-4">
              <h3 class="font-semibold text-lg mb-1">Play & Update Scores</h3>
              <p class="text-gray-700">
                As matches are played, admins update the scores and match status (Upcoming → In Progress → Completed).
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Benefits -->
      <div class="card mb-8">
        <h2 class="text-2xl font-semibold mb-4">Benefits of Round-Robin</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="text-2xl mb-2">✅</div>
            <h3 class="font-semibold mb-1">Fair Competition</h3>
            <p class="text-sm text-gray-700">Every team faces the same opponents</p>
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="text-2xl mb-2">🎯</div>
            <h3 class="font-semibold mb-1">More Matches</h3>
            <p class="text-sm text-gray-700">Teams get to play multiple games</p>
          </div>

          <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div class="text-2xl mb-2">📊</div>
            <h3 class="font-semibold mb-1">Better Rankings</h3>
            <p class="text-sm text-gray-700">More data for accurate standings</p>
          </div>

          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="text-2xl mb-2">⚡</div>
            <h3 class="font-semibold mb-1">Automatic Scheduling</h3>
            <p class="text-sm text-gray-700">No manual pairing required</p>
          </div>
        </div>
      </div>

      <!-- Example -->
      <div class="card">
        <h2 class="text-2xl font-semibold mb-4">Example: 4 Teams</h2>
        <p class="text-gray-700 mb-4">
          With 4 teams (Team A, Team B, Team C, Team D), the system generates 6 matches:
        </p>
        <div class="bg-gray-50 rounded-lg p-4 space-y-2 font-mono text-sm">
          <div class="flex justify-between items-center p-2 bg-white rounded">
            <span>Match 1:</span>
            <span class="font-semibold">Team A vs Team B</span>
          </div>
          <div class="flex justify-between items-center p-2 bg-white rounded">
            <span>Match 2:</span>
            <span class="font-semibold">Team A vs Team C</span>
          </div>
          <div class="flex justify-between items-center p-2 bg-white rounded">
            <span>Match 3:</span>
            <span class="font-semibold">Team A vs Team D</span>
          </div>
          <div class="flex justify-between items-center p-2 bg-white rounded">
            <span>Match 4:</span>
            <span class="font-semibold">Team B vs Team C</span>
          </div>
          <div class="flex justify-between items-center p-2 bg-white rounded">
            <span>Match 5:</span>
            <span class="font-semibold">Team B vs Team D</span>
          </div>
          <div class="flex justify-between items-center p-2 bg-white rounded">
            <span>Match 6:</span>
            <span class="font-semibold">Team C vs Team D</span>
          </div>
        </div>
        <p class="text-gray-700 mt-4">
          Each team plays exactly <strong>3 matches</strong> (against the 3 other teams).
        </p>
      </div>

      <!-- CTA -->
      <div class="mt-8 text-center">
        <NuxtLink
          v-if="isAuthenticated"
          to="/tournaments"
          class="btn btn-primary text-lg px-8 py-3"
        >
          View Tournaments
        </NuxtLink>
        <NuxtLink
          v-else
          to="/register"
          class="btn btn-primary text-lg px-8 py-3"
        >
          Get Started
        </NuxtLink>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { isAuthenticated } = useAuth()
</script>
