document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Reset activity select to default option to avoid duplicates
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <p class="participants-title">Signed Up:</p>
            <ul class="participants-list">
              ${
                details.participants.length > 0
                    ? details.participants
                    .map(
                      (email) =>
                        `<li class="participant-item">${email} <button class="delete-participant" data-activity="${encodeURIComponent(
                          name
                        )}" data-email="${encodeURIComponent(email)}" title="Unregister">✖</button></li>`
                    )
                    .join("")
                  : '<li class="no-participants">No participants yet</li>'
              }
            </ul>
          </div>
        `;

          activitiesList.appendChild(activityCard);

          // Attach delete handlers for this card's buttons
          activityCard.querySelectorAll('.delete-participant').forEach((btn) => {
            btn.addEventListener('click', async (e) => {
              e.preventDefault();
              const activityName = decodeURIComponent(btn.dataset.activity);
              const email = decodeURIComponent(btn.dataset.email);
              if (!confirm(`Unregister ${email} from ${activityName}?`)) return;
              try {
                const res = await fetch(
                  `/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(email)}`,
                  { method: 'DELETE' }
                );
                const data = await res.json();
                if (res.ok) {
                  messageDiv.textContent = data.message;
                  messageDiv.className = 'success';
                  messageDiv.classList.remove('hidden');
                  setTimeout(() => messageDiv.classList.add('hidden'), 5000);
                  // Refresh the activities and select options
                  activitySelect.innerHTML = '<option value="">-- Select activity --</option>';
                  fetchActivities();
                } else {
                  messageDiv.textContent = data.detail || 'Failed to unregister';
                  messageDiv.className = 'error';
                  messageDiv.classList.remove('hidden');
                  setTimeout(() => messageDiv.classList.add('hidden'), 5000);
                }
              } catch (err) {
                console.error('Error unregistering:', err);
                messageDiv.textContent = 'Failed to unregister. Please try again.';
                messageDiv.className = 'error';
                messageDiv.classList.remove('hidden');
                setTimeout(() => messageDiv.classList.add('hidden'), 5000);
              }
            });
          });

          // Add option to select dropdown
          const option = document.createElement("option");
          option.value = name;
          option.textContent = name;
          activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Function to render activities
  function renderActivities(activities) {
    const container = document.getElementById("activities-container");
    container.innerHTML = "";

    Object.entries(activities).forEach(([name, activity]) => {
      const card = document.createElement("div");
      card.className = "activity-card";

      const title = document.createElement("h3");
      title.textContent = name;
      card.appendChild(title);

      const description = document.createElement("p");
      description.textContent = activity.description;
      card.appendChild(description);

      const maxParticipants = document.createElement("p");
      maxParticipants.className = "max-participants";
      maxParticipants.textContent = `Max: ${activity.max_participants}`;
      card.appendChild(maxParticipants);

      // Participantes section
      const participantsSection = document.createElement("div");
      participantsSection.className = "participants-section";

      const participantsTitle = document.createElement("p");
      participantsTitle.className = "participants-title";
      participantsTitle.textContent = "Signed Up:";
      participantsSection.appendChild(participantsTitle);

      const participantsList = document.createElement("ul");
      participantsList.className = "participants-list";

      if (activity.participants && activity.participants.length > 0) {
        activity.participants.forEach((email) => {
          const listItem = document.createElement("li");
          listItem.textContent = email;
          participantsList.appendChild(listItem);
        });
      } else {
        const emptyItem = document.createElement("li");
        emptyItem.className = "no-participants";
        emptyItem.textContent = "No participants yet";
        participantsList.appendChild(emptyItem);
      }

      participantsSection.appendChild(participantsList);
      card.appendChild(participantsSection);

      const form = document.createElement("form");
      form.onsubmit = (e) => handleSignup(e, name);

      const input = document.createElement("input");
      input.type = "email";
      input.placeholder = "Enter your email";
      input.required = true;
      form.appendChild(input);

      const button = document.createElement("button");
      button.type = "submit";
      button.textContent = "Sign Up";
      form.appendChild(button);

      card.appendChild(form);
      container.appendChild(card);
    });
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities list so the new participant appears immediately
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
