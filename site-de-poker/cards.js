      const numCards = 12;
      const cards = [];
      const speeds = [];
      const rotations = [];
      const verticalOffsets = [];
      const cardImages = ["card-red.png", "card-black.png"];
      const baseRight = 0;

      for (let i = 0; i < numCards; i++) {
        const card = document.createElement('img');

        card.src = cardImages[Math.floor(Math.random() * cardImages.length)];
        card.className = 'falling-card';

        // Wider random horizontal offset for more spread-out cards (0 to 150px)
        const randomRightOffset = Math.random() * 400;
        card.style.right = (baseRight + randomRightOffset) + 'px';

        // Start at a random vertical position anywhere on the screen
        const initialTop = Math.random() * window.innerHeight;
        card.style.top = initialTop + 'px';

        const rotation = (Math.random() * 60) - 30;
        card.style.transform = `rotate(${rotation}deg)`;

        // Slower fall speeds between 0.3 and 1 pixels per frame
        speeds[i] = 0.3 + Math.random() * 0.7;
        rotations[i] = rotation;
        verticalOffsets[i] = initialTop;
        cards[i] = card;

        document.body.appendChild(card);
      }

      function animate() {
        for (let i = 0; i < cards.length; i++) {
          verticalOffsets[i] += speeds[i];

          if (verticalOffsets[i] > window.innerHeight) {
            verticalOffsets[i] = -100;

            // Change image randomly again
            cards[i].src = cardImages[Math.floor(Math.random() * cardImages.length)];

            // More spread horizontal shift
            const randomRightOffset = Math.random() * 400;
            cards[i].style.right = (baseRight + randomRightOffset) + 'px';

            // Random rotation
            const newRotation = (Math.random() * 60) - 30;
            rotations[i] = newRotation;

            // Also reset speed to new slow random speed
            speeds[i] = 0.3 + Math.random() * 0.7;
          }

          cards[i].style.top = verticalOffsets[i] + 'px';
          cards[i].style.transform = `rotate(${rotations[i]}deg)`;
        }
        requestAnimationFrame(animate);
      }

      animate();