<template>
  <NuxtLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div v-if="loading" class="text-center py-12">
        <div class="text-gray-600">Loading tournament...</div>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ error }}
      </div>

      <div v-else-if="tournament">
        <!-- Tournament Completed Celebration Banner -->
        <div
          v-if="tournament.status === 'COMPLETED' && !bannerDismissed"
          class="mb-6 bg-yellow-300 border-4 border-yellow-500 rounded-lg p-6 text-center shadow-lg animate-pulse relative"
        >
          <button
            @click="bannerDismissed = true"
            class="absolute top-2 right-2 text-yellow-900 hover:text-yellow-700 text-2xl font-bold leading-none"
            title="Dismiss banner"
          >
            ×
          </button>
          <div class="text-5xl mb-2">🏆🎉🎊</div>
          <h2 class="text-3xl font-bold text-yellow-900 mb-2">Tournament Completed!</h2>
          <p class="text-lg text-yellow-800 mb-4">
            Congratulations to all participants! All matches have been played.
          </p>
          <button
            v-if="activeTab !== 'standings'"
            @click="activeTab = 'standings'; fetchStandings()"
            class="bg-yellow-900 hover:bg-yellow-800 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            🏆 View Final Standings
          </button>
        </div>

        <!-- Tournament Header -->
        <div class="mb-8">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h1 class="text-4xl font-bold mb-2">{{ tournament.name }}</h1>
              <div class="flex items-center space-x-4 text-gray-600">
                <span class="flex items-center">
                  <span class="mr-1">📅</span>
                  {{ formatDate(tournament.date) }}
                </span>
                <span
                  :class="getStatusClass(tournament.status)"
                  class="px-3 py-1 text-sm font-semibold rounded-full"
                >
                  {{ tournament.status }}
                </span>
              </div>
            </div>
            <div v-if="isAdmin" class="flex space-x-2">
              <button
                @click="openEditModal"
                class="btn btn-secondary"
              >
                Edit
              </button>
              <button
                @click="deleteTournament"
                class="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>

          <p v-if="tournament.description" class="text-gray-700 mb-4">
            {{ tournament.description }}
          </p>

          <div class="text-sm text-gray-500">
            Created by {{ tournament.createdBy?.username }}
          </div>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200 mb-6">
          <nav class="-mb-px flex space-x-8">
            <button
              @click="activeTab = 'teams'"
              :class="activeTab === 'teams' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Teams ({{ teams.length }})
            </button>
            <button
              @click="activeTab = 'matches'"
              :class="activeTab === 'matches' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Matches ({{ matches.length }})
            </button>
            <button
              v-if="matches.length > 0"
              @click="activeTab = 'standings'; fetchStandings()"
              :class="activeTab === 'standings' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              🏆 Standings
            </button>
          </nav>
        </div>

        <!-- Teams Tab -->
        <div v-if="activeTab === 'teams'" class="space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-semibold">Teams</h2>
            <button
              v-if="isAdmin"
              @click="showAddTeamModal = true"
              class="btn btn-primary"
            >
              + Add Team
            </button>
            <button
              v-else-if="user && !userHasTeam"
              @click="openRegisterModal"
              class="btn btn-primary"
            >
              + Register Team
            </button>
          </div>

          <div v-if="teams.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
            <p class="text-gray-600 mb-4">No teams yet</p>
            <button
              v-if="isAdmin"
              @click="showAddTeamModal = true"
              class="btn btn-primary"
            >
              Add First Team
            </button>
            <button
              v-else-if="user && !userHasTeam"
              @click="openRegisterModal"
              class="btn btn-primary"
            >
              Register First Team
            </button>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="team in teams"
              :key="team.id"
              :class="[
                'card',
                isUserInTeam(team) ? 'ring-2 ring-primary-500 bg-primary-50' : ''
              ]"
            >
              <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-2">
                  <h3 class="text-lg font-semibold">{{ team.name }}</h3>
                  <span v-if="isUserInTeam(team)" class="px-2 py-1 text-xs font-semibold bg-primary-500 text-white rounded-full">
                    Your Team
                  </span>
                </div>
                <button
                  v-if="isAdmin"
                  @click="deleteTeam(team.id)"
                  class="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
              <div class="space-y-1 text-sm text-gray-600 mb-3">
                <!-- Show registered users if available -->
                <template v-if="team.members && team.members.length > 0">
                  <div v-for="(member, idx) in team.members" :key="member.id">
                    <span class="font-medium">{{ member.user.username }}</span>
                    <span class="text-gray-400 ml-1">({{ member.user.email }})</span>
                  </div>
                </template>
                <!-- Show guest player names for admin-created teams -->
                <template v-else-if="team.player1Name && team.player2Name">
                  <div>Player 1: {{ team.player1Name }}</div>
                  <div>Player 2: {{ team.player2Name }}</div>
                </template>
              </div>

              <!-- Leave team button for user's own team -->
              <div v-if="isUserInTeam(team) && !isAdmin" class="mt-3 pt-3 border-t border-gray-200">
                <button
                  v-if="matches.length === 0"
                  @click="confirmLeaveTeam(team.id)"
                  class="w-full text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Leave Team
                </button>
                <div v-else class="text-xs text-gray-500 italic text-center">
                  Cannot leave team - matches already generated
                </div>
              </div>
            </div>
          </div>

          <div v-if="isAdmin && teams.length >= 2 && matches.length === 0" class="mt-6">
            <div class="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <span class="text-2xl">⚡</span>
                </div>
                <div class="ml-3 flex-1">
                  <h4 class="text-sm font-semibold text-primary-900 mb-1">
                    Ready to Generate Matches
                  </h4>
                  <p class="text-sm text-primary-700">
                    With {{ teams.length }} teams, the round-robin algorithm will create
                    <strong>{{ calculateMatchCount(teams.length) }} matches</strong> where each team plays against every other team exactly once.
                  </p>
                </div>
              </div>
            </div>
            <button
              @click="generateMatches"
              :disabled="generatingMatches"
              class="btn btn-primary w-full text-lg py-3"
            >
              <span v-if="generatingMatches">⏳ Generating Matches...</span>
              <span v-else>⚡ Generate Round-Robin Matches</span>
            </button>
          </div>
        </div>

        <!-- Matches Tab -->
        <div v-if="activeTab === 'matches'" class="space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-semibold">Matches</h2>
            <div v-if="matches.length > 0" class="text-sm text-gray-500">
              {{ matches.length }} matches • Round-Robin
            </div>
          </div>

          <div v-if="matches.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
            <div class="text-6xl mb-4">📅</div>
            <p class="text-gray-600 mb-4 text-lg font-medium">No matches scheduled yet</p>

            <div v-if="teams.length < 2" class="max-w-md mx-auto">
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p class="text-sm text-yellow-800">
                  ⚠️ You need at least 2 teams to generate matches
                </p>
              </div>
              <p class="text-sm text-gray-500">
                Add more teams in the Teams tab to enable match generation
              </p>
            </div>

            <div v-else-if="isAdmin" class="max-w-md mx-auto">
              <div class="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
                <p class="text-sm text-primary-700 mb-2">
                  <strong>Round-Robin System:</strong> Each team will play against every other team exactly once.
                </p>
                <p class="text-sm text-primary-700">
                  With <strong>{{ teams.length }} teams</strong>, this will create <strong>{{ calculateMatchCount(teams.length) }} matches</strong>.
                </p>
              </div>
              <button
                @click="generateMatches"
                :disabled="generatingMatches"
                class="btn btn-primary text-lg px-8 py-3"
              >
                <span v-if="generatingMatches">⏳ Generating...</span>
                <span v-else>⚡ Generate Matches</span>
              </button>
            </div>

            <div v-else class="text-sm text-gray-500">
              Matches will be generated by the tournament administrator
            </div>
          </div>

          <div v-else class="space-y-4">
            <!-- Info banner -->
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-start justify-between">
                <div class="flex items-start flex-1">
                  <div class="flex-shrink-0">
                    <span class="text-2xl">✅</span>
                  </div>
                  <div class="ml-3">
                    <h4 class="text-sm font-semibold text-green-900 mb-1">
                      Round-Robin Schedule Generated
                    </h4>
                    <p class="text-sm text-green-700">
                      All {{ teams.length }} teams will play against each other exactly once for a total of {{ matches.length }} matches.
                      Each team will play {{ teams.length - 1 }} matches.
                    </p>
                  </div>
                </div>
                <div v-if="isAdmin" class="ml-4">
                  <button
                    @click="deleteAllMatches"
                    class="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors whitespace-nowrap"
                    title="Delete all matches to allow new team registrations"
                  >
                    🗑️ Reset Matches
                  </button>
                </div>
              </div>
            </div>

            <!-- Matches list -->
            <div
              v-for="match in matches"
              :key="match.id"
              class="card"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="text-sm text-gray-500 mb-2">Match #{{ match.matchNumber }}</div>
                  <div class="flex items-center space-x-4">
                    <div class="flex-1">
                      <div class="flex items-center">
                        <div class="font-semibold" :class="match.homeScore === 10 ? 'text-green-600' : ''">
                          {{ match.homeTeam?.name }}
                        </div>
                        <span v-if="match.homeScore === 10" class="ml-2 text-xl">🏆</span>
                      </div>
                      <div class="text-sm text-gray-600">
                        <template v-if="match.homeTeam?.members && match.homeTeam.members.length > 0">
                          {{ match.homeTeam.members.map(m => m.user.username).join(' & ') }}
                        </template>
                        <template v-else>
                          {{ match.homeTeam?.player1Name }} & {{ match.homeTeam?.player2Name }}
                        </template>
                      </div>
                    </div>
                    <div class="text-2xl font-bold px-4">
                      <span :class="[
                        match.homeScore !== null ? 'text-gray-900' : 'text-gray-300',
                        match.homeScore === 10 ? 'text-green-600' : ''
                      ]">
                        {{ match.homeScore ?? '-' }}
                      </span>
                      <span class="text-gray-400 mx-2">:</span>
                      <span :class="[
                        match.awayScore !== null ? 'text-gray-900' : 'text-gray-300',
                        match.awayScore === 10 ? 'text-green-600' : ''
                      ]">
                        {{ match.awayScore ?? '-' }}
                      </span>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center">
                        <div class="font-semibold" :class="match.awayScore === 10 ? 'text-green-600' : ''">
                          {{ match.awayTeam?.name }}
                        </div>
                        <span v-if="match.awayScore === 10" class="ml-2 text-xl">🏆</span>
                      </div>
                      <div class="text-sm text-gray-600">
                        <template v-if="match.awayTeam?.members && match.awayTeam.members.length > 0">
                          {{ match.awayTeam.members.map(m => m.user.username).join(' & ') }}
                        </template>
                        <template v-else>
                          {{ match.awayTeam?.player1Name }} & {{ match.awayTeam?.player2Name }}
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="ml-4 flex items-center space-x-3">
                  <span
                    :class="getMatchStatusClass(match.status)"
                    class="px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap"
                  >
                    {{ match.status }}
                  </span>
                  <button
                    v-if="isAdmin"
                    @click="editMatch(match)"
                    class="btn btn-secondary text-sm"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Standings Tab -->
        <div v-if="activeTab === 'standings'" class="space-y-6">
          <h2 class="text-2xl font-semibold">Standings & Statistics</h2>

          <div v-if="loadingStandings" class="text-center py-12">
            <div class="text-gray-600">Loading standings...</div>
          </div>

          <div v-else-if="standingsError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {{ standingsError }}
          </div>

          <div v-else-if="standings.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
            <p class="text-gray-600">No standings data available yet. Complete some matches to see the standings.</p>
          </div>

          <div v-else>
            <!-- Status banner -->
            <div v-if="tournament?.status === 'COMPLETED'" class="relative bg-green-50 border-2 border-green-300 rounded-lg p-6 mb-6 overflow-hidden">
              <div class="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div class="absolute top-2 left-[10%] text-2xl animate-bounce">🎉</div>
                <div class="absolute top-4 right-[15%] text-2xl animate-bounce" style="animation-delay: 0.2s">🎊</div>
                <div class="absolute bottom-3 left-[20%] text-2xl animate-bounce" style="animation-delay: 0.4s">⭐</div>
                <div class="absolute bottom-2 right-[25%] text-2xl animate-bounce" style="animation-delay: 0.6s">🏆</div>
              </div>
              <div class="relative flex items-center justify-center">
                <span class="text-5xl mr-4 animate-pulse">🏆</span>
                <div class="text-center">
                  <!-- Multiple champions (tie) -->
                  <template v-if="champions.length > 1">
                    <h3 class="text-2xl font-bold text-green-900 mb-2">🎉 Tournament Co-Champions! 🎉</h3>
                    <p class="text-lg text-green-700 mb-1">
                      Tied for first place:
                    </p>
                    <div class="flex flex-wrap justify-center gap-2 mb-2">
                      <strong
                        v-for="champion in champions"
                        :key="champion.team.id"
                        class="text-xl text-yellow-700"
                      >
                        {{ champion.team.name }}
                      </strong>
                    </div>
                    <p class="text-sm text-gray-600">
                      with {{ champions[0]?.stats.points }} points, {{ champions[0]?.stats.goalDifference > 0 ? '+' : '' }}{{ champions[0]?.stats.goalDifference }} goal difference
                    </p>
                  </template>
                  <!-- Single champion -->
                  <template v-else>
                    <h3 class="text-2xl font-bold text-green-900 mb-2">🎉 Tournament Champion! 🎉</h3>
                    <p class="text-lg text-green-700">
                      Congratulations to <strong class="text-xl text-yellow-700">{{ standings[0]?.team.name }}</strong>
                    </p>
                    <p class="text-sm text-gray-600 mt-1">
                      with {{ standings[0]?.stats.points }} points and {{ standings[0]?.stats.wins }} wins!
                    </p>
                  </template>
                </div>
              </div>
            </div>

            <!-- Standings Table -->
            <div class="card overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pos
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team
                      </th>
                      <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        P
                      </th>
                      <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        W
                      </th>
                      <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        D
                      </th>
                      <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        L
                      </th>
                      <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        GF
                      </th>
                      <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        GA
                      </th>
                      <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        GD
                      </th>
                      <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Pts
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr
                      v-for="standing in standings"
                      :key="standing.team.id"
                      :class="standing.position === 1 ? 'bg-yellow-50' : ''"
                    >
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <span
                            v-if="standing.position === 1"
                            class="text-2xl mr-2"
                          >
                            🥇
                          </span>
                          <span
                            v-else-if="standing.position === 2"
                            class="text-2xl mr-2"
                          >
                            🥈
                          </span>
                          <span
                            v-else-if="standing.position === 3"
                            class="text-2xl mr-2"
                          >
                            🥉
                          </span>
                          <span class="text-sm font-medium text-gray-900">
                            {{ standing.position }}
                          </span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ standing.team.name }}
                        </div>
                        <div class="text-xs text-gray-500">
                          <template v-if="standing.team.members && standing.team.members.length > 0">
                            {{ standing.team.members.map(m => m.user.username).join(' & ') }}
                          </template>
                          <template v-else>
                            {{ standing.team.player1Name }} & {{ standing.team.player2Name }}
                          </template>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {{ standing.stats.played }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600 font-medium">
                        {{ standing.stats.wins }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                        {{ standing.stats.draws }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600">
                        {{ standing.stats.losses }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {{ standing.stats.goalsFor }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {{ standing.stats.goalsAgainst }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium"
                          :class="standing.stats.goalDifference > 0 ? 'text-green-600' : standing.stats.goalDifference < 0 ? 'text-red-600' : 'text-gray-600'"
                      >
                        {{ standing.stats.goalDifference > 0 ? '+' : '' }}{{ standing.stats.goalDifference }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-primary-600">
                        {{ standing.stats.points }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Legend -->
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-xs text-gray-600 grid grid-cols-2 md:grid-cols-5 gap-2">
                <div><strong>P:</strong> Played</div>
                <div><strong>W:</strong> Wins</div>
                <div><strong>D:</strong> Draws</div>
                <div><strong>L:</strong> Losses</div>
                <div><strong>GF:</strong> Goals For</div>
                <div><strong>GA:</strong> Goals Against</div>
                <div><strong>GD:</strong> Goal Difference</div>
                <div><strong>Pts:</strong> Points (Win=3, Draw=1)</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Tournament Modal -->
        <div
          v-if="showEditModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          @click.self="showEditModal = false"
        >
          <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-2xl font-bold mb-4">Edit Tournament</h3>
            <form @submit.prevent="updateTournament" class="space-y-4">
              <div v-if="editError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {{ editError }}
              </div>

              <div>
                <label for="edit-name" class="block text-sm font-medium text-gray-700 mb-2">
                  Tournament Name *
                </label>
                <input
                  id="edit-name"
                  v-model="editForm.name"
                  type="text"
                  required
                  class="input"
                  placeholder="Summer Championship 2025"
                />
              </div>

              <div>
                <label for="edit-description" class="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  v-model="editForm.description"
                  rows="4"
                  class="input"
                  placeholder="Annual summer tournament for all skill levels..."
                ></textarea>
              </div>

              <div>
                <label for="edit-date" class="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  id="edit-date"
                  v-model="editForm.date"
                  type="datetime-local"
                  required
                  class="input"
                />
              </div>

              <div class="flex space-x-3">
                <button
                  type="submit"
                  :disabled="updatingTournament"
                  class="btn btn-primary flex-1"
                >
                  <span v-if="updatingTournament">Updating...</span>
                  <span v-else>Save Changes</span>
                </button>
                <button
                  type="button"
                  @click="showEditModal = false"
                  class="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Add Team Modal -->
        <div
          v-if="showAddTeamModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          @click.self="showAddTeamModal = false"
        >
          <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-2xl font-bold mb-4">Add Team</h3>
            <form @submit.prevent="addTeam" class="space-y-4">
              <div v-if="teamError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {{ teamError }}
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Team Name *
                </label>
                <input
                  v-model="teamForm.name"
                  type="text"
                  required
                  class="input"
                  placeholder="The Champions"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Player 1 Name *
                </label>
                <input
                  v-model="teamForm.player1Name"
                  type="text"
                  required
                  class="input"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Player 2 Name *
                </label>
                <input
                  v-model="teamForm.player2Name"
                  type="text"
                  required
                  class="input"
                  placeholder="Jane Smith"
                />
              </div>

              <div class="flex space-x-3">
                <button
                  type="submit"
                  :disabled="addingTeam"
                  class="btn btn-primary flex-1"
                >
                  <span v-if="addingTeam">Adding...</span>
                  <span v-else>Add Team</span>
                </button>
                <button
                  type="button"
                  @click="showAddTeamModal = false"
                  class="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Register Team Modal (for non-admin users) -->
        <div
          v-if="showRegisterTeamModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          @click.self="showRegisterTeamModal = false"
        >
          <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-2xl font-bold mb-4">Register Your Team</h3>
            <form @submit.prevent="registerTeam" class="space-y-4">
              <div v-if="registerSuccess" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {{ registerSuccess }}
              </div>
              <div v-if="registerError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {{ registerError }}
              </div>

              <div class="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm mb-4">
                <p class="font-semibold mb-1">How it works:</p>
                <ul class="list-disc list-inside space-y-1 text-xs">
                  <li>Enter your team name and your partner's email</li>
                  <li>Your partner must have an account</li>
                  <li>You can only have one team per tournament</li>
                </ul>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Team Name *
                </label>
                <input
                  v-model="registerForm.name"
                  type="text"
                  required
                  class="input"
                  placeholder="The Champions"
                />
              </div>

              <div class="relative">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Partner Email *
                </label>
                <input
                  v-model="registerForm.partnerEmail"
                  type="email"
                  required
                  class="input"
                  placeholder="partner@example.com"
                  @focus="emailInputFocused = true"
                  @blur="handleEmailBlur"
                  autocomplete="off"
                />

                <!-- Email suggestions dropdown -->
                <div
                  v-if="emailInputFocused && emailSuggestions.length > 0"
                  class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                >
                  <button
                    v-for="suggestion in emailSuggestions"
                    :key="suggestion.id"
                    type="button"
                    @click="selectEmail(suggestion.email)"
                    class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                  >
                    <div>
                      <div class="font-medium text-sm">{{ suggestion.username }}</div>
                      <div class="text-xs text-gray-500">{{ suggestion.email }}</div>
                    </div>
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <p class="text-xs text-gray-500 mt-1">
                  Your partner must have an account. If they don't, ask them to register first.
                </p>
              </div>

              <div class="flex space-x-3">
                <button
                  type="submit"
                  :disabled="registeringTeam"
                  class="btn btn-primary flex-1"
                >
                  <span v-if="registeringTeam">Registering...</span>
                  <span v-else>Register Team</span>
                </button>
                <button
                  type="button"
                  @click="showRegisterTeamModal = false"
                  class="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Edit Match Modal -->
        <div
          v-if="showEditMatchModal && selectedMatch"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          @click.self="showEditMatchModal = false"
        >
          <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-2xl font-bold mb-4">Edit Match #{{ selectedMatch.matchNumber }}</h3>
            <form @submit.prevent="updateMatch" class="space-y-4">
              <div v-if="matchError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {{ matchError }}
              </div>

              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="mb-2">{{ selectedMatch.homeTeam?.name }} vs {{ selectedMatch.awayTeam?.name }}</div>
              </div>

              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div class="flex items-center text-sm text-blue-800">
                  <span class="mr-2">ℹ️</span>
                  <div>
                    <strong>Baby-foot rules:</strong> First team to reach <strong>10 goals</strong> wins the match
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ selectedMatch.homeTeam?.name }} Score
                  </label>
                  <input
                    v-model.number="matchForm.homeScore"
                    type="number"
                    min="0"
                    max="10"
                    class="input"
                    :class="matchForm.homeScore === 10 ? 'border-green-500 ring-2 ring-green-200' : ''"
                    placeholder="0"
                    @wheel="handleScoreWheel($event, 'home')"
                  />
                  <div v-if="matchForm.homeScore === 10" class="text-xs text-green-600 font-semibold mt-1">
                    🏆 Winner!
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ selectedMatch.awayTeam?.name }} Score
                  </label>
                  <input
                    v-model.number="matchForm.awayScore"
                    type="number"
                    min="0"
                    max="10"
                    class="input"
                    :class="matchForm.awayScore === 10 ? 'border-green-500 ring-2 ring-green-200' : ''"
                    placeholder="0"
                    @wheel="handleScoreWheel($event, 'away')"
                  />
                  <div v-if="matchForm.awayScore === 10" class="text-xs text-green-600 font-semibold mt-1">
                    🏆 Winner!
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select v-model="matchForm.status" class="input">
                  <option value="UPCOMING">Upcoming</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>

                <!-- Warning when COMPLETED is selected but no winner -->
                <div
                  v-if="matchForm.status === 'COMPLETED' && (matchForm.homeScore ?? 0) < 10 && (matchForm.awayScore ?? 0) < 10"
                  class="mt-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded text-xs"
                >
                  ⚠️ One team must reach 10 goals to complete the match
                </div>
              </div>

              <div class="flex space-x-3">
                <button
                  type="submit"
                  :disabled="updatingMatch"
                  class="btn btn-primary flex-1"
                >
                  <span v-if="updatingMatch">Updating...</span>
                  <span v-else>Update Match</span>
                </button>
                <button
                  type="button"
                  @click="showEditMatchModal = false"
                  class="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { isAdmin, user } = useAuth()
const route = useRoute()
const router = useRouter()

const tournamentId = route.params.id as string

const tournament = ref<any>(null)
const teams = ref<any[]>([])
const matches = ref<any[]>([])
const standings = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const loadingStandings = ref(false)
const standingsError = ref('')

const activeTab = ref('teams')
const bannerDismissed = ref(false)

// Team modal
const showAddTeamModal = ref(false)
const teamForm = reactive({
  name: '',
  player1Name: '',
  player2Name: ''
})
const addingTeam = ref(false)
const teamError = ref('')

// Match modal
const showEditMatchModal = ref(false)
const selectedMatch = ref<any>(null)
const matchForm = reactive({
  homeScore: null as number | null,
  awayScore: null as number | null,
  status: 'UPCOMING'
})
const updatingMatch = ref(false)
const matchError = ref('')

// Other modals
const showEditModal = ref(false)
const generatingMatches = ref(false)

// Edit tournament modal
const editForm = reactive({
  name: '',
  description: '',
  date: ''
})
const editError = ref('')
const updatingTournament = ref(false)

const formatDateTimeLocal = (date: string) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const openEditModal = () => {
  if (tournament.value) {
    editForm.name = tournament.value.name
    editForm.description = tournament.value.description || ''
    editForm.date = formatDateTimeLocal(tournament.value.date)
    showEditModal.value = true
  }
}

const updateTournament = async () => {
  updatingTournament.value = true
  editError.value = ''

  try {
    await $fetch(`/api/tournaments/${tournamentId}`, {
      method: 'PUT',
      body: {
        name: editForm.name,
        description: editForm.description || undefined,
        date: new Date(editForm.date).toISOString()
      }
    })

    showEditModal.value = false
    await fetchTournament()
  } catch (e: any) {
    editError.value = e.data?.message || 'Failed to update tournament'
  } finally {
    updatingTournament.value = false
  }
}

// Register team modal (for non-admin users)
const showRegisterTeamModal = ref(false)
const registerForm = reactive({
  name: '',
  partnerEmail: ''
})
const registeringTeam = ref(false)
const registerError = ref('')
const registerSuccess = ref('')
const allUsers = ref<any[]>([])
const showEmailSuggestions = ref(false)
const emailInputFocused = ref(false)

// Filtered email suggestions
const emailSuggestions = computed(() => {
  if (!registerForm.partnerEmail || !emailInputFocused.value) return []

  const searchTerm = registerForm.partnerEmail.toLowerCase()
  return allUsers.value
    .filter(u =>
      u.email.toLowerCase().includes(searchTerm) ||
      u.username.toLowerCase().includes(searchTerm)
    )
    .filter(u => u.email !== user.value?.email) // Exclude current user
    .slice(0, 5) // Limit to 5 suggestions
})

// Get all teams at position 1 (champions, handles ties)
const champions = computed(() => {
  return standings.value.filter(standing => standing.position === 1)
})

// Fetch users when modal opens
const openRegisterModal = async () => {
  showRegisterTeamModal.value = true
  if (allUsers.value.length === 0) {
    try {
      const response = await $fetch('/api/users')
      allUsers.value = response.users
    } catch (e) {
      console.error('Failed to load users:', e)
    }
  }
}

// Select email from suggestions
const selectEmail = (email: string) => {
  registerForm.partnerEmail = email
  showEmailSuggestions.value = false
  emailInputFocused.value = false
}

// Handle blur with delay to allow click on suggestions
const handleEmailBlur = () => {
  setTimeout(() => {
    emailInputFocused.value = false
  }, 200)
}

// Check if current user already has a team in this tournament
const userHasTeam = computed(() => {
  if (!user.value || !teams.value) return false
  return teams.value.some(team =>
    team.members?.some((member: any) => member.userId === user.value.id)
  )
})

const registerTeam = async () => {
  registeringTeam.value = true
  registerError.value = ''
  registerSuccess.value = ''

  try {
    await $fetch(`/api/tournaments/${tournamentId}/register`, {
      method: 'POST',
      body: {
        name: registerForm.name,
        partnerEmail: registerForm.partnerEmail
      }
    })

    // Close modal immediately
    showRegisterTeamModal.value = false

    // Clear form
    registerForm.name = ''
    registerForm.partnerEmail = ''

    // Reload the page to show the updated team list with confirmation
    window.location.reload()
  } catch (e: any) {
    registerError.value = e.data?.message || 'Failed to register team'
  } finally {
    registeringTeam.value = false
  }
}

// Check if user is in a specific team
const isUserInTeam = (team: any) => {
  if (!user.value || !team.members) return false
  return team.members.some((member: any) => member.userId === user.value.id)
}

// Leave team functionality
const confirmLeaveTeam = async (teamId: string) => {
  if (!confirm('Are you sure you want to leave this team? This action cannot be undone.')) {
    return
  }

  try {
    await $fetch(`/api/teams/${teamId}/leave`, {
      method: 'POST'
    })

    // Redirect to tournaments list
    navigateTo('/tournaments')
  } catch (e: any) {
    alert(e.data?.message || 'Failed to leave team')
  }
}

const getStatusClass = (status: string) => {
  const classes = {
    UPCOMING: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getMatchStatusClass = (status: string) => {
  const classes = {
    UPCOMING: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const calculateMatchCount = (teamCount: number) => {
  // Round-robin formula: n(n-1)/2
  return (teamCount * (teamCount - 1)) / 2
}

const fetchTournament = async () => {
  try {
    const data = await $fetch(`/api/tournaments/${tournamentId}`)
    tournament.value = data.tournament
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to load tournament'
  }
}

const fetchTeams = async () => {
  try {
    const data = await $fetch(`/api/tournaments/${tournamentId}/teams`)
    teams.value = data.teams
  } catch (e: any) {
    console.error('Failed to load teams:', e)
  }
}

const fetchMatches = async () => {
  try {
    const data = await $fetch(`/api/tournaments/${tournamentId}/matches`)
    matches.value = data.matches
  } catch (e: any) {
    console.error('Failed to load matches:', e)
  }
}

const fetchStandings = async () => {
  loadingStandings.value = true
  standingsError.value = ''
  try {
    const data = await $fetch(`/api/tournaments/${tournamentId}/standings`)
    standings.value = data.standings
  } catch (e: any) {
    standingsError.value = e.data?.message || 'Failed to load standings'
  } finally {
    loadingStandings.value = false
  }
}

const addTeam = async () => {
  addingTeam.value = true
  teamError.value = ''

  try {
    await $fetch(`/api/tournaments/${tournamentId}/teams`, {
      method: 'POST',
      body: teamForm
    })

    showAddTeamModal.value = false
    teamForm.name = ''
    teamForm.player1Name = ''
    teamForm.player2Name = ''
    await fetchTeams()
  } catch (e: any) {
    teamError.value = e.data?.message || 'Failed to add team'
  } finally {
    addingTeam.value = false
  }
}

const deleteTeam = async (teamId: string) => {
  if (!confirm('Are you sure you want to delete this team?')) return

  try {
    await $fetch(`/api/teams/${teamId}`, {
      method: 'DELETE'
    })
    await fetchTeams()
  } catch (e: any) {
    alert(e.data?.message || 'Failed to delete team')
  }
}

const generateMatches = async () => {
  generatingMatches.value = true

  try {
    await $fetch(`/api/tournaments/${tournamentId}/matches/generate`, {
      method: 'POST'
    })
    await fetchMatches()
    activeTab.value = 'matches'
  } catch (e: any) {
    alert(e.data?.message || 'Failed to generate matches')
  } finally {
    generatingMatches.value = false
  }
}

const deleteAllMatches = async () => {
  if (!confirm('Are you sure you want to delete ALL matches? This will allow new teams to register and you can regenerate the matches afterwards.')) {
    return
  }

  try {
    const response: any = await $fetch(`/api/tournaments/${tournamentId}/matches`, {
      method: 'DELETE'
    })

    alert(response.message || 'Matches deleted successfully')

    // Refresh data
    await Promise.all([
      fetchTournament(),
      fetchMatches(),
      fetchTeams()
    ])
  } catch (e: any) {
    alert(e.data?.message || 'Failed to delete matches')
  }
}

const editMatch = (match: any) => {
  selectedMatch.value = match
  matchForm.homeScore = match.homeScore ?? 0
  matchForm.awayScore = match.awayScore ?? 0
  matchForm.status = match.status
  showEditMatchModal.value = true
}

const handleScoreWheel = (event: WheelEvent, scoreType: 'home' | 'away') => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? -1 : 1

  if (scoreType === 'home') {
    const currentScore = matchForm.homeScore ?? 0
    matchForm.homeScore = Math.max(0, Math.min(10, currentScore + delta))
  } else {
    const currentScore = matchForm.awayScore ?? 0
    matchForm.awayScore = Math.max(0, Math.min(10, currentScore + delta))
  }
}

const updateMatch = async () => {
  if (!selectedMatch.value) return

  updatingMatch.value = true
  matchError.value = ''

  // Client-side validation: if marking as COMPLETED, one team must have 10 goals
  if (matchForm.status === 'COMPLETED') {
    const homeScore = matchForm.homeScore ?? 0
    const awayScore = matchForm.awayScore ?? 0

    if (homeScore < 10 && awayScore < 10) {
      matchError.value = 'Cannot mark match as COMPLETED: one team must reach 10 goals to win'
      updatingMatch.value = false
      return
    }
  }

  try {
    await $fetch(`/api/matches/${selectedMatch.value.id}`, {
      method: 'PUT',
      body: {
        homeScore: matchForm.homeScore,
        awayScore: matchForm.awayScore,
        status: matchForm.status
      }
    })

    showEditMatchModal.value = false

    // Refresh tournament data (status will be auto-updated)
    await Promise.all([
      fetchTournament(),
      fetchMatches()
    ])

    // Refresh standings if on that tab
    if (activeTab.value === 'standings') {
      await fetchStandings()
    }
  } catch (e: any) {
    matchError.value = e.data?.message || 'Failed to update match'
  } finally {
    updatingMatch.value = false
  }
}

const deleteTournament = async () => {
  if (!confirm('Are you sure you want to delete this tournament? This will also delete all teams and matches.')) return

  try {
    await $fetch(`/api/tournaments/${tournamentId}`, {
      method: 'DELETE'
    })
    router.push('/tournaments')
  } catch (e: any) {
    alert(e.data?.message || 'Failed to delete tournament')
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([
    fetchTournament(),
    fetchTeams(),
    fetchMatches()
  ])
  loading.value = false
})
</script>
