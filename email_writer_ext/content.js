console.log("Email writer extension loaded");

function getEmailContent() {
  const selectors = ['.h7', '.a3S.aiL', '.gmail_quote', '[role="presentation"]'];
  for (const selector of selectors) {
    const content = document.querySelector(selector);
    if (content) {
      return content.innerText.trim();
    }
  }
  return ''; 
}


function findComposeToolbar() {
  const selectors = ['.btC', '.aDh', '[role="toolbar"]', '.gU.Up'];
  for (const selector of selectors) {
    const toolbar = document.querySelector(selector);
    if (toolbar) return toolbar;
  }
  return null;
}

function createAIButton() {
  const button = document.createElement('div');
  button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3 ai-reply-button';
  button.style.marginRight = '8px';
  button.innerText = 'AI Reply';
  button.setAttribute('role', 'button');
  button.setAttribute('data-tooltip', 'Generate AI Reply');
  return button;
}

function injectButton() {
  const existingButton = document.querySelector('.ai-reply-button');
  if (existingButton) existingButton.remove();

  const toolbar = findComposeToolbar();
  if (!toolbar) {
    console.log("Toolbar not found");
    return;
  }

  console.log("Toolbar found, creating AI button...");
  const button = createAIButton();

  button.addEventListener('click', () => {
      button.innerText = 'Generating...';
      button.style.opacity = '0.7';
      button.disabled = true;

      const emailContent = getEmailContent();

      chrome.runtime.sendMessage(
        {
          type: "GENERATE_REPLY",
          payload: {
            emailContent: emailContent,
            tone: "Professional"
          }
        },
        (response) => {
          try {
            if (response && response.success) {
              const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
              if (composeBox) {
                composeBox.focus();
                composeBox.innerText = response.data;
              } else {
                console.error('Compose box not found');
              }
            } else {
              alert("Failed to generate reply");
              console.error(response?.error);
            }
          } finally {
            button.innerText = 'AI Reply';
            button.style.opacity = '1';
            button.disabled = false;
          }
        }
      );
});


  toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    const addedNodes = Array.from(mutation.addedNodes);
    const hasComposeElements = addedNodes.some(node =>
      node.nodeType === Node.ELEMENT_NODE &&
      (node.matches('.aDh, .btC, [role="dialog"]') ||
        node.querySelector('.aDh, .btC, [role="dialog"]'))
    );

    if (hasComposeElements) {
      console.log("Compose window detected");
      setTimeout(injectButton, 500);
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
