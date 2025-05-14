// Language Utilities

// Default language (can be changed based on browser settings or user selection)
let currentLanguage_7ree = 'zh'; 

/**
 * Sets the current language for translations.
 * @param {string} lang - The language code (e.g., 'en', 'zh').
 */
function setCurrentLanguage_7ree(lang) {
    if (lang_7ree && lang_7ree[lang]) {
        currentLanguage_7ree = lang;
        console.log(`[Lang] Language set to: ${lang}`);
        // Optionally, trigger UI updates if language changes dynamically
        // document.dispatchEvent(new CustomEvent('languageChanged'));
    } else {
        console.warn(`[Lang] Language '${lang}' not found in lang_7ree data. Keeping '${currentLanguage_7ree}'.`);
    }
}

/**
 * Gets the translated text for a given key.
 * Handles basic placeholder replacement like {key}.
 * @param {string} key - The key for the text in lang_7ree.
 * @param {object} [replacements={}] - Optional object with key-value pairs for placeholder replacement.
 * @returns {string} The translated text or the key if not found.
 */
function getText_7ree(key, replacements = {}) {
    let text = key; // Default to key if not found

    if (lang_7ree && lang_7ree[currentLanguage_7ree] && lang_7ree[currentLanguage_7ree][key]) {
        text = lang_7ree[currentLanguage_7ree][key];
    } else if (lang_7ree && lang_7ree['en'] && lang_7ree['en'][key]) {
        // Fallback to English if key not found in current language
        text = lang_7ree['en'][key];
        // console.warn(`[Lang] Key '${key}' not found for language '${currentLanguage_7ree}', falling back to 'en'.`);
    } else {
        console.warn(`[Lang] Key '${key}' not found for language '${currentLanguage_7ree}' or fallback 'en'.`);
    }

    // Replace placeholders
    for (const placeholder in replacements) {
        if (replacements.hasOwnProperty(placeholder)) {
            const regex = new RegExp(`\{${placeholder}\}`, 'g');
            text = text.replace(regex, replacements[placeholder]);
        }
    }

    return text;
}

// --- Example Usage ---
// console.log(getText_7ree('someKey'));
// console.log(getText_7ree('greeting', { name: 'Player' })); 

// --- Initialization ---
// Determine initial language (e.g., from browser, localStorage, or default)
// setCurrentLanguage_7ree('zh'); // Set initial language 