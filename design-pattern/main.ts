import { User, SportsEventSubject } from './behavioral/liveSportsObserver';
import { RideService, NormalStrategy, SurgeStrategy, WeatherStrategy, PricingConditions } from './behavioral/dynamicPricingStrategy';
import { GlobalSettings } from './creational/globalSettingsSingleton';
import { SmartDeviceFactory } from './creational/smartDeviceFactory';
import { BasicEmail, SignatureDecorator, PromoDecorator, FooterDecorator, HighlightDecorator, EncryptionDecorator, composeEmail, Email } from './structural/emailTemplateDecorator';
import { TwitterAdapter, FacebookAdapter, LinkedInAdapter, InstagramAdapter, SocialMediaBroadcaster, validateMessage } from './structural/socialMediaAdapter';
import { Twitter, Facebook, LinkedIn, Instagram } from './structural/socialMediaAdapter';
import { delay, separator } from './utility';



async function main(): Promise<void> {
    try {
        separator("OBSERVER PATTERN - Live Sports Score Updates");
        
        const matchSubject = new SportsEventSubject("Premier League: Manchester vs Liverpool");
        
        const alice = new User("user_001", "Alice");
        const bob = new User("user_002", "Bob");
        const charlie = new User("user_003", "Charlie");
        
        // Subscribe users to match updates
        matchSubject.subscribe(alice);
        matchSubject.subscribe(bob);
        matchSubject.subscribe(charlie);
        
        console.log(`Active subscribers: ${matchSubject.getObserverCount()}\n`);
        
        matchSubject.scoreUpdate("Manchester", 1, "15:32");
        await delay(500);
        
        matchSubject.scoreUpdate("Liverpool", 1, "28:45");
        await delay(500);
        
        console.log("\n[Bob unsubscribed from updates]\n");
        matchSubject.unsubscribe(bob);
        
        matchSubject.scoreUpdate("Manchester", 2, "67:12");
        await delay(500);
        
        matchSubject.gameEnd("Manchester", "2-1");
        
        console.log(`\nTotal events logged: ${matchSubject.getEventHistory().length}`);


        separator("STRATEGY PATTERN - Dynamic Ride Pricing");
        
        const baseFare = 25.00;
        const conditions: PricingConditions = {
            weather: 'rainy',
            demand: 'high',
            timeOfDay: 'night',
            distance: 15
        };
        
        const rideService = new RideService(new NormalStrategy());
        
        // Scenario 1: Normal conditions
        console.log("📍 Scenario 1: Normal Day, Low Demand");
        let fare = rideService.calculateFare(baseFare);
        console.log(`   Base Fare: $${baseFare} → Final Fare: $${fare}\n`);
        
        // Scenario 2: High demand (surge pricing)
        console.log("📍 Scenario 2: High Demand, Rush Hour");
        rideService.setStrategy(new SurgeStrategy(2.5));
        fare = rideService.calculateFare(baseFare);
        console.log(`   Base Fare: $${baseFare} → Final Fare: $${fare}\n`);
        
        // Scenario 3: Bad weather
        console.log("📍 Scenario 3: Rainy Weather");
        rideService.setStrategy(new WeatherStrategy());
        fare = rideService.calculateFare(baseFare);
        console.log(`   Base Fare: $${baseFare} → Final Fare: $${fare}\n`);
        
        // Scenario 4: Back to normal
        console.log("📍 Scenario 4: Conditions Normalized");
        rideService.setStrategy(new NormalStrategy());
        fare = rideService.calculateFare(baseFare);
        console.log(`   Base Fare: $${baseFare} → Final Fare: $${fare}`);


        separator("SINGLETON PATTERN - Global Application Settings");
        
        const settings1 = GlobalSettings.getInstance();
        
        console.log("Initial Settings:");
        console.log(settings1.getAllSettings());
        
        // Modify settings
        console.log("\n🔧 Updating settings...");
        settings1.set("debugMode", true);
        settings1.set("maxRetries", 5);
        settings1.set("theme", "dark");
        settings1.set("language", "en-US");
        
        const settings2 = GlobalSettings.getInstance();
        
        console.log("\n✅ Verifying singleton behavior:");
        console.log(`   Instance 1 debugMode: ${settings1.get("debugMode")}`);
        console.log(`   Instance 2 debugMode: ${settings2.get("debugMode")}`);
        console.log(`   Same instance? ${settings1 === settings2}`);
        
        console.log("\n📜 Change History:");
        const history = settings2.getChangeHistory();
        history.slice(-3).forEach(change => {
            console.log(`   ${change.key}: ${change.oldValue} → ${change.newValue}`);
        });


        separator("FACTORY PATTERN - Smart Home Device Creation");
        
        console.log("🏭 Creating smart home devices...\n");
        
        // Create different device types
        const light = SmartDeviceFactory.createDevice("light", "living-room-light");
        const camera = SmartDeviceFactory.createDevice("camera", "front-door-cam");
        const thermostat = SmartDeviceFactory.createDevice("thermostat", "main-thermostat");
        
        console.log(`\n📊 Total devices created: ${SmartDeviceFactory.getDeviceCount()}`);
        console.log(`📋 Supported types: ${SmartDeviceFactory.getSupportedTypes().join(', ')}\n`);
        
        console.log("🔧 Testing device capabilities:\n");
        
        console.log(`${light.getType()} (${light.getId()}):`);
        console.log(`   Capabilities: ${light.getCapabilities().join(', ')}`);
        await light.performAction('toggle');
        await light.performAction('setBrightness', { level: 75 });
        await light.performAction('setColor', { color: 'warm-white' });
        
        console.log(`\n${camera.getType()} (${camera.getId()}):`);
        console.log(`   Capabilities: ${camera.getCapabilities().join(', ')}`);
        await camera.performAction('startRecording');
        await camera.performAction('setResolution', { resolution: '4K' });
        await camera.performAction('takeSnapshot');
        
        console.log(`\n${thermostat.getType()} (${thermostat.getId()}):`);
        console.log(`   Capabilities: ${thermostat.getCapabilities().join(', ')}`);
        await thermostat.performAction('setTemperature', { temperature: 68 });
        await thermostat.performAction('setMode', { mode: 'cooling' });


        separator("DECORATOR PATTERN - Email Template Builder");
        
        // Example 1: Basic email with signature
        console.log("📧 Email 1: Basic + Signature\n");
        let email1:Email = new BasicEmail("Team Meeting Tomorrow", "Don't forget our team sync at 10 AM.");
        email1 = new SignatureDecorator(email1, "John Smith", "Best regards", true);
        console.log(email1.getContent());
        console.log(`Subject: ${email1.getSubject()}`);
        
        console.log("\n" + "-".repeat(60) + "\n");
        
        // Example 2: Marketing email with multiple decorators
        console.log("📧 Email 2: Marketing Email (Full Stack)\n");
        let email2:Email = new BasicEmail("Exclusive Offer Inside!", "Check out our latest products and deals.");
        email2 = new HighlightDecorator(email2, "latest", "✨");
        email2 = new PromoDecorator(email2, "Limited Time: 50% OFF Everything!", "🎁");
        email2 = new SignatureDecorator(email2, "Marketing Team", "Cheers", false);
        email2 = new FooterDecorator(email2, true, true);
        console.log(email2.getContent());
        console.log(`\n📋 Subject: ${email2.getSubject()}`);
        
        const metadata2 = email2.getMetadata();
        console.log(`🏷️  Decorators Applied: ${metadata2.decorators.join(' → ')}`);
        console.log(`⏰ Timestamp: ${metadata2.timestamp.toLocaleString()}`);
        
        console.log("\n" + "-".repeat(60) + "\n");
        
        // Example 3: Encrypted email
        console.log("📧 Email 3: Encrypted Confidential Message\n");
        let email3:Email = new BasicEmail("Confidential Report", "Quarterly financial results are attached.");
        email3 = new EncryptionDecorator(email3);
        console.log(`Subject: ${email3.getSubject()}`);
        console.log(email3.getContent());
        
        // Decrypt the content
        if (email3 instanceof EncryptionDecorator) {
            console.log(`\n🔓 Decrypted Content:\n${email3.getDecryptedContent()}`);
            console.log(`Encrypted: ${email3.isEncrypted()}`);
        }
        
        console.log("\n" + "-".repeat(60) + "\n");
        
        // Example 4: Using compose utility
        console.log("📧 Email 4: Composed Email (Using Utility Function)\n");
        const email4 = composeEmail(
            new BasicEmail("Product Launch Announcement", "We are excited to unveil our revolutionary new product!"),
            (e) => new HighlightDecorator(e, "revolutionary", "🌟"),
            (e) => new PromoDecorator(e, "Early Bird Discount: 30% OFF", "🚀"),
            (e) => new SignatureDecorator(e, "Product Team", "Warm regards", true),
            (e) => new FooterDecorator(e, true, false)
        );
        console.log(email4.getContent());
        const metadata4 = email4.getMetadata();
        console.log(`\n🏷️  Decorators: ${metadata4.decorators.join(' → ')}`);


        separator("ADAPTER PATTERN - Unified Social Media Posting");
        
        const twitter = new TwitterAdapter(new Twitter());
        const facebook = new FacebookAdapter(new Facebook());
        const linkedIn = new LinkedInAdapter(new LinkedIn());
        const instagram = new InstagramAdapter(new Instagram());
        
        const shortMessage = "Excited to announce our new product launch! 🚀";
        const longMessage = "We are thrilled to announce the launch of our groundbreaking new product that will revolutionize the industry! After months of hard work and dedication from our amazing team, we're finally ready to share this innovation with the world. Join us on this exciting journey as we transform the way people interact with technology. Stay tuned for more updates and exclusive offers coming your way!";
        
        // Example 1: Individual platform posting
        console.log("📱 Example 1: Individual Platform Posts\n");
        
        const result1 = await twitter.postMessage(shortMessage);
        console.log(`${result1.platform}:`);
        console.log(`   Status: ${result1.success ? '✅ Success' : '❌ Failed'}`);
        console.log(`   Message ID: ${result1.messageId}`);
        console.log(`   Character Limit: ${twitter.getCharacterLimit()}`);
        
        const result2 = await facebook.postMessage(shortMessage);
        console.log(`\n${result2.platform}:`);
        console.log(`   Status: ${result2.success ? '✅ Success' : '❌ Failed'}`);
        console.log(`   Message ID: ${result2.messageId}`);
        console.log(`   Character Limit: ${facebook.getCharacterLimit()}`);
        
        console.log("\n" + "-".repeat(60) + "\n");
        
        // Example 2: Message validation before posting
        console.log("📱 Example 2: Message Validation\n");
        
        const platforms = [twitter, facebook, linkedIn];
        const validation = validateMessage(longMessage, platforms);
        
        console.log(`Message Length: ${longMessage.length} characters`);
        console.log(`Validation Result: ${validation.valid ? '✅ Valid' : '❌ Invalid'}\n`);
        
        if (!validation.valid) {
            console.log("Issues found:");
            validation.issues.forEach(issue => console.log(`   ⚠️  ${issue}`));
        }
        
        console.log("\n" + "-".repeat(60) + "\n");
        
        // Example 3: Using broadcaster for multiple platforms
        console.log("📱 Example 3: Multi-Platform Broadcasting\n");
        
        const broadcaster = new SocialMediaBroadcaster()
            .addPlatform(twitter)
            .addPlatform(facebook)
            .addPlatform(linkedIn)
            .addPlatform(instagram);
        
        console.log(`Configured platforms: ${broadcaster.getPlatforms().join(', ')}\n`);
        
        const broadcastMessage = "Join us for our exclusive webinar next Tuesday at 3 PM! 📅";
        console.log(`Broadcasting: "${broadcastMessage}"\n`);
        
        const results = await broadcaster.broadcast(broadcastMessage);
        
        console.log("Broadcast Results:");
        results.forEach(result => {
            console.log(`   ${result.platform}:`);
            console.log(`      Status: ${result.success ? '✅' : '❌'}`);
            console.log(`      Time: ${result.timestamp.toLocaleTimeString()}`);
            if (result.messageId) console.log(`      ID: ${result.messageId}`);
            if (result.error) console.log(`      Error: ${result.error}`);
        });
        
        console.log("\n" + "-".repeat(60) + "\n");
        
        // Example 4: Selective platform broadcasting
        console.log("📱 Example 4: Selective Platform Broadcast\n");
        
        const professionalMessage = "Thrilled to share our Q4 achievements and roadmap for 2025. Read the full report on our website.";
        console.log(`Professional Message: "${professionalMessage}"`);
        console.log(`Target Platforms: LinkedIn, Twitter\n`);
        
        const selectiveResults = await broadcaster.broadcastToSelected(
            professionalMessage, 
            ['LinkedIn', 'Twitter']
        );
        
        console.log("Selective Broadcast Results:");
        selectiveResults.forEach(result => {
            console.log(`   ${result.platform}: ${result.success ? '✅ Posted' : '❌ Failed'}`);
        });
        
        console.log("\n" + "-".repeat(60) + "\n");
        
        // Example 5: Platform removal and re-broadcast
        console.log("📱 Example 5: Dynamic Platform Management\n");
        
        console.log("Removing Instagram from broadcaster...");
        broadcaster.removePlatform('Instagram');
        console.log(`Updated platforms: ${broadcaster.getPlatforms().join(', ')}\n`);
        
        const updatedMessage = "Quick update: Our platform is now live! Check it out.";
        const updatedResults = await broadcaster.broadcast(updatedMessage);
        
        console.log(`Broadcast to ${updatedResults.length} platforms:`);
        updatedResults.forEach(result => {
            console.log(`   ${result.platform}: ${result.success ? '✅' : '❌'}`);
        });


        separator("EXECUTION SUMMARY");
        
        console.log("✅ All design patterns demonstrated successfully!\n");
        console.log("Patterns Covered:");
        console.log("  🔵 Behavioral:");
        console.log("     - Observer Pattern (Live Sports Updates)");
        console.log("       • Multiple observers subscribing/unsubscribing");
        console.log("       • Event history tracking");
        console.log("       • Priority-based notifications\n");
        console.log("     - Strategy Pattern (Dynamic Ride Pricing)");
        console.log("       • Runtime strategy switching");
        console.log("       • Multiple pricing algorithms");
        console.log("       • Context-aware pricing\n");
        
        console.log("  🟢 Creational:");
        console.log("     - Singleton Pattern (Global Settings)");
        console.log("       • Single instance guarantee");
        console.log("       • Global state management");
        console.log("       • Change history tracking\n");
        console.log("     - Factory Pattern (Smart Device Creation)");
        console.log("       • Encapsulated object creation");
        console.log("       • Multiple device types");
        console.log("       • Capability-based operations\n");
        
        console.log("  🟡 Structural:");
        console.log("     - Decorator Pattern (Email Templates)");
        console.log("       • Dynamic behavior addition");
        console.log("       • Multiple decorators chaining");
        console.log("       • Encryption, signatures, footers, highlights");
        console.log("       • Compose utility for cleaner syntax\n");
        console.log("     - Adapter Pattern (Social Media Integration)");
        console.log("       • Unified interface for different platforms");
        console.log("       • Message validation across platforms");
        console.log("       • Broadcasting to multiple platforms");
        console.log("       • Selective and dynamic platform management\n");
        
        console.log("📊 Statistics:");
        console.log(`   Total Devices Created: ${SmartDeviceFactory.getDeviceCount()}`);
        console.log(`   Total Events in Sports Match: ${matchSubject.getEventHistory().length}`);
        console.log(`   Settings Changes Tracked: ${settings1.getChangeHistory().length}`);
        console.log(`   Social Platforms Demonstrated: 4 (Twitter, Facebook, LinkedIn, Instagram)`);

    } catch (error) {
        console.error("\n❌ ERROR OCCURRED:");
        console.error(`   ${(error as Error).message}`);
        console.error(`   Stack: ${(error as Error).stack}`);
    }
}

main().then(() => {
    console.log("\n" + "=".repeat(60));
    console.log("  Program completed successfully");
    console.log("=".repeat(60) + "\n");
}).catch(error => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
});