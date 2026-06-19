// ==========================================
// SUPABASE CONFIGURATION - UPDATE THESE!
// ==========================================
const SUPABASE_URL = 'https://larhfxegjcxvyjpjckeg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhcmhmeGVnamN4dnlqcGpja2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NjM1OTgsImV4cCI6MjA5NzQzOTU5OH0.7reCUz7FYNkt4O_nIZA27xgve2oLuRhFIA5b8fSIzHg';

let supabaseClient = null;
let sessionId = localStorage.getItem('analytics_session_id');
let userLocation = 'Unknown';
let userIp = 'Unknown';
let maxScroll = 0;
let timeSpent = 0;

// Initialize Supabase if keys are provided
if(SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.warn("Analytics tracking is disabled because Supabase keys are not set.");
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

if (!sessionId) {
    sessionId = generateUUID();
    localStorage.setItem('analytics_session_id', sessionId);
}

// Fetch Location & IP
fetch('https://ipapi.co/json/')
    .then(response => response.json())
    .then(data => {
        userIp = data.ip || 'Unknown';
        userLocation = (data.city && data.country_name) ? `${data.city}, ${data.country_name}` : 'Unknown';
        
        // Log Initial Page View once location is fetched
        logEvent('page_view', 'Home Page');
    })
    .catch(err => {
        console.error("Could not fetch location data", err);
        logEvent('page_view', 'Home Page');
    });


// Get Device Info
function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "Mobile";
    return "Desktop";
}
const deviceType = getDeviceType();
const referrerSrc = document.referrer ? new URL(document.referrer).hostname : 'Direct';
const screenRes = `${window.screen.width}x${window.screen.height}`;

// Helper to send event to Supabase
async function logEvent(eventType, plotName = null) {
    if(!supabaseClient) return;
    
    try {
        const { error } = await supabaseClient
            .from('analytics_events')
            .insert([{
                event_type: eventType,
                plot_name: plotName,
                timestamp: new Date().toISOString(),
                session_id: sessionId,
                ip_address: userIp,
                location: userLocation,
                scroll_depth: maxScroll,
                time_spent_seconds: timeSpent,
                device_type: deviceType,
                referrer: referrerSrc,
                screen_resolution: screenRes
            }]);
            
        if(error) console.error("Error logging event:", error);
    } catch(e) {
        console.error("Supabase insert error", e);
    }
}

// 1. Track Scroll Depth
window.addEventListener('scroll', () => {
    let scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    if(scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
    }
});

// 2. Track Time Spent (update every 30 seconds)
setInterval(() => {
    timeSpent += 30;
    logEvent('time_spent', 'Periodic Update');
}, 30000);

// Log time spent and scroll when user closes the page
window.addEventListener("beforeunload", () => {
    logEvent('time_spent', 'User Left Site');
});

// 3. Track WhatsApp Clicks on all ".modal-wa", ".wa-float", and ".header-contact a"
document.addEventListener('click', (e) => {
    const waLink = e.target.closest('a[href*="wa.me"], a.modal-wa, a.wa-float');
    if(waLink) {
        logEvent('whatsapp_click', 'General Inquiry');
    }
});

// Expose a function to track plot views specifically from the modal
window.trackPlotView = function(plotTitle) {
    logEvent('plot_view', plotTitle);
};
