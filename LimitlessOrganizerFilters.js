// ==UserScript==
// @name         LimitlessOrganizersFilters
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds a fixed div to filter tournaments by organizer, with smooth toggle animation
// @author       Matux
// @match        https://play.limitlesstcg.com/tournaments*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const STORAGE_KEY = 'limitless_organizers_state';

    // Get all unique organizers from the page
    let organizersOnPage = new Set();
    document.querySelectorAll('[data-organizer]').forEach(row => {
        organizersOnPage.add(row.getAttribute('data-organizer'));
    });

    // Load stored organizer states from localStorage
    let organizerState = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

    // Add new organizers to the storage (default to true)
    let updated = false;
    organizersOnPage.forEach(organizer => {
        if (!(organizer in organizerState)) {
            organizerState[organizer] = true;
            updated = true;
        }
    });

    // Save only if there are updates
    if (updated) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(organizerState));
    }

    // Function to update the display of tournament rows
    function updateDisplay() {
        document.querySelectorAll('[data-organizer]').forEach(row => {
            let org = row.getAttribute('data-organizer');
            row.style.display = organizerState[org] ? '' : 'none';
        });
    }

    // Add CSS for the toggle switches and animations
    let style = document.createElement('style');
    style.innerHTML = `
        .switch {
            position: relative;
            display: inline-block;
            width: 40px;
            height: 22px;
        }
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 22px;
        }
        .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        input:checked + .slider {
            background-color: #4CAF50;
        }
        input:checked + .slider:before {
            transform: translateX(18px);
        }

        /* Smooth expand/collapse animation */
        .filter-content {
            transition: max-height 0.4s ease-in-out, opacity 0.3s ease-in-out;
            max-height: 0;
            opacity: 0;
            overflow: hidden;
        }
        .filter-content.open {
            max-height: 500px; /* Large enough to fit content */
            opacity: 1;
        }
    `;
    document.head.appendChild(style);

    // Create a floating div in the top-right corner
    let filterDiv = document.createElement('div');
    filterDiv.style.position = 'fixed';
    filterDiv.style.top = '85px';
    filterDiv.style.right = '10px';
    filterDiv.style.background = 'rgba(0, 0, 0, 0.8)';
    filterDiv.style.color = 'white';
    filterDiv.style.padding = '10px';
    filterDiv.style.borderRadius = '10px';
    filterDiv.style.zIndex = '1000';
    filterDiv.style.width = '250px';
    filterDiv.style.border = '5px solid white';
    filterDiv.style.outline = '1px solid black';
    filterDiv.style.overflowX = 'hidden';
    filterDiv.style.maxWidth = '250px';
    filterDiv.style.boxSizing = 'border-box';

    // Title (clickable for toggle)
    let title = document.createElement('h3');
    title.textContent = 'Filter by Organizer';
    title.style.margin = '0 0 0 0';
    title.style.fontSize = '14px';
    title.style.textAlign = 'center';
    title.style.cursor = 'pointer';
    title.onclick = function () {
        filterContent.classList.toggle('open');
    };
    filterDiv.appendChild(title);

    // Container for toggleable content
    let filterContent = document.createElement('div');
    filterContent.classList.add('filter-content');

    // Buttons for global actions
    let resetButton = document.createElement('button');
    resetButton.textContent = 'Show All';
    resetButton.style.display = 'block';
    resetButton.style.width = '100%';
    resetButton.style.marginBottom = '5px';
    resetButton.style.marginTop = '10px';
    resetButton.style.background = '#28a745';
    resetButton.style.color = 'white';
    resetButton.onclick = function () {
        Object.keys(organizerState).forEach(org => {
            organizerState[org] = true;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(organizerState));
        document.querySelectorAll('.switch input').forEach(toggle => toggle.checked = true);
        updateDisplay();
    };
    filterContent.appendChild(resetButton);

    let hideAllButton = document.createElement('button');
    hideAllButton.textContent = 'Hide All';
    hideAllButton.style.display = 'block';
    hideAllButton.style.width = '100%';
    hideAllButton.style.marginBottom = '10px';
    hideAllButton.style.background = '#dc3545';
    hideAllButton.style.color = 'white';
    hideAllButton.onclick = function () {
        Object.keys(organizerState).forEach(org => {
            organizerState[org] = false;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(organizerState));
        document.querySelectorAll('.switch input').forEach(toggle => toggle.checked = false);
        updateDisplay();
    };
    filterContent.appendChild(hideAllButton);

    // Container for the scrollable list
    let listContainer = document.createElement('div');
    listContainer.style.maxHeight = '300px';
    listContainer.style.overflowY = 'auto';
    listContainer.style.overflowX = 'hidden';
    listContainer.style.maxWidth = '100%';


    // Add toggle switches for each organizer
    Object.keys(organizerState).forEach(organizer => {
        let toggleContainer = document.createElement('div');
        toggleContainer.style.display = 'flex';
        toggleContainer.style.alignItems = 'center';
        toggleContainer.style.justifyContent = 'space-between';
        toggleContainer.style.marginBottom = '5px';
        toggleContainer.style.padding = '5px';
        toggleContainer.style.background = '#ccc';
        toggleContainer.style.borderRadius = '3px';

        let label = document.createElement('span');
        label.textContent = organizer;

        let switchLabel = document.createElement('label');
        switchLabel.classList.add('switch');

        let switchInput = document.createElement('input');
        switchInput.type = 'checkbox';
        switchInput.checked = organizerState[organizer];

        let switchSpan = document.createElement('span');
        switchSpan.classList.add('slider');

        switchInput.onchange = function () {
            organizerState[organizer] = switchInput.checked;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(organizerState));
            updateDisplay();
        };

        switchLabel.appendChild(switchInput);
        switchLabel.appendChild(switchSpan);

        toggleContainer.appendChild(label);
        toggleContainer.appendChild(switchLabel);
        listContainer.appendChild(toggleContainer);
    });

    filterContent.appendChild(listContainer);
    filterDiv.appendChild(filterContent);
    document.body.appendChild(filterDiv);

    updateDisplay();
})();
