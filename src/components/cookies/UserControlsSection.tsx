import React from 'react';
import CookiePolicySection from './CookiePolicySection';

const UserControlsSection: React.FC = () => {
  return (
    <CookiePolicySection title="5. Managing Your Cookie Preferences" id="user-controls">
      <p className="mb-4">
        You have several options for controlling cookies on our website:
      </p>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Cookie Preference Center</h3>
          <p className="mb-2">
            You can manage your cookie preferences using our cookie banner that appears 
            when you first visit our site. You can also access your preferences at any time 
            through the cookie settings link in our website footer.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Accept or reject non-essential cookies</li>
            <li>Choose specific cookie categories</li>
            <li>Change your preferences at any time</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Browser Settings</h3>
          <p className="mb-2">
            Most web browsers allow you to control cookies through their settings:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Block all cookies</li>
            <li>Block third-party cookies only</li>
            <li>Delete existing cookies</li>
            <li>Set up notifications for new cookies</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Google Analytics Opt-Out</h3>
          <p className="mb-2">
            You can opt out of Google Analytics tracking by:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Installing the Google Analytics Opt-out Browser Add-on</li>
            <li>Using our cookie preference center to disable analytics cookies</li>
            <li>Enabling "Do Not Track" in your browser settings</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="font-semibold mb-2 text-foreground">Important Note:</p>
        <p>
          Disabling certain cookies may affect website functionality and your user experience. 
          Essential cookies cannot be disabled as they are necessary for basic website operations 
          and security.
        </p>
      </div>
    </CookiePolicySection>
  );
};

export default UserControlsSection;