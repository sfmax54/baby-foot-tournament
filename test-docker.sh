#!/bin/bash
# Script de test pour Docker
# Exécutez ce script pour tester la configuration Docker

set -e

echo "🐳 Test de la configuration Docker"
echo "=================================="
echo ""

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    echo "Installez Docker depuis: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✅ Docker est installé: $(docker --version)"
echo ""

# Vérifier que Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "⚠️  docker-compose n'est pas installé (optionnel)"
    echo "Vous pouvez utiliser 'docker compose' à la place"
else
    echo "✅ Docker Compose est installé: $(docker-compose --version)"
fi
echo ""

# Construire l'image
echo "📦 Construction de l'image Docker..."
docker build -t baby-foot-tournament .

if [ $? -eq 0 ]; then
    echo "✅ Image construite avec succès"
else
    echo "❌ Échec de la construction de l'image"
    exit 1
fi
echo ""

# Afficher la taille de l'image
echo "📊 Taille de l'image:"
docker images baby-foot-tournament
echo ""

# Créer le dossier data s'il n'existe pas
if [ ! -d "./data" ]; then
    echo "📁 Création du dossier data/"
    mkdir -p ./data
fi

# Lancer le conteneur
echo "🚀 Lancement du conteneur..."
docker run -d \
  --name baby-foot-tournament-test \
  -p 3000:3000 \
  -v "$(pwd)/data:/app/data" \
  -e JWT_SECRET=test-secret-key \
  baby-foot-tournament

if [ $? -eq 0 ]; then
    echo "✅ Conteneur lancé avec succès"
else
    echo "❌ Échec du lancement du conteneur"
    exit 1
fi
echo ""

# Attendre que le serveur démarre
echo "⏳ Attente du démarrage du serveur (30 secondes)..."
sleep 30

# Vérifier le health check
echo "🏥 Test du health check..."
HEALTH_RESPONSE=$(curl -s http://localhost:3000/api/health)

if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    echo "✅ Health check réussi: $HEALTH_RESPONSE"
else
    echo "❌ Health check échoué"
    echo "Logs du conteneur:"
    docker logs baby-foot-tournament-test
    docker stop baby-foot-tournament-test
    docker rm baby-foot-tournament-test
    exit 1
fi
echo ""

# Afficher les logs
echo "📝 Derniers logs du conteneur:"
docker logs --tail=20 baby-foot-tournament-test
echo ""

# Informations
echo "✅ Test terminé avec succès!"
echo ""
echo "🌐 Application disponible sur: http://localhost:3000"
echo ""
echo "Commandes utiles:"
echo "  - Voir les logs:        docker logs -f baby-foot-tournament-test"
echo "  - Arrêter:              docker stop baby-foot-tournament-test"
echo "  - Supprimer:            docker rm baby-foot-tournament-test"
echo "  - Shell du conteneur:   docker exec -it baby-foot-tournament-test sh"
echo ""
echo "Pour arrêter et nettoyer:"
echo "  docker stop baby-foot-tournament-test && docker rm baby-foot-tournament-test"
