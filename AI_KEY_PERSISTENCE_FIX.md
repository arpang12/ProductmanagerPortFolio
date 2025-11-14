# AI API Key Persistence Fix

## Problem
Users reported that the API key "disappears" after saving. When reopening AI Settings, the API key field was empty, making it seem like the key wasn't saved.

## Root Cause
This was actually **intentional for security** - the API key is never returned from the database to the frontend (it returns `***hidden***` instead). However, the UX was confusing because:
1. Empty field made it look like the key wasn't saved
2. No indication that the key was securely stored
3. Users had to re-enter the key every time they wanted to change the model

## Solution
Improved the UX to make it clear that the API key is saved and secure, while allowing users to update just the model without re-entering the key.

---

## Changes Made

### 1. Enhanced UI Feedback
**File**: `components/AISettingsManager.tsx`

#### Added "Saved" Indicator
```typescript
<label>
    API Key {settings?.isConfigured && 
        <span className="text-green-600">✓ Saved</span>
    }
</label>
```

#### Dynamic Placeholder
```typescript
placeholder={
    settings?.isConfigured 
        ? "API key is saved (enter new key to update)" 
        : "Enter your Gemini API key"
}
```

#### Contextual Help Text
```typescript
{settings?.isConfigured ? (
    <p>🔒 Your API key is securely stored. Leave empty to keep current key, or enter a new one to update.</p>
) : (
    <p>Get your API key from <a href="...">Google AI Studio</a></p>
)}
```

### 2. Smart Save Logic
**File**: `components/AISettingsManager.tsx`

```typescript
const handleSave = async () => {
    // If API key is empty and already configured, keep existing key
    if (!tempApiKey.trim() && settings.isConfigured) {
        // Update only the model
        await api.updateAISettings({
            ...settings,
            selectedModel: tempModel
            // Don't send apiKey
        });
        return;
    }
    
    // If API key is provided, update it
    if (!tempApiKey.trim()) {
        alert('Please enter an API key');
        return;
    }
    
    // Full update with new API key
    await api.updateAISettings({
        ...settings,
        apiKey: tempApiKey,
        selectedModel: tempModel
    });
};
```

### 3. Partial Update Support
**File**: `services/api.ts`

```typescript
async updateAISettings(settings: Partial<AISettings>): Promise<AISettings> {
    // If API key is not provided, preserve existing one
    if (!settings.apiKey && settings.id) {
        // Update only the model, keep existing API key
        const { data, error } = await supabase
            .from('ai_configurations')
            .update({
                selected_model: settings.selectedModel,
                updated_at: new Date().toISOString()
            })
            .eq('config_id', settings.id)
            .select()
            .single();
        
        return { ...data, apiKey: '***hidden***' };
    }
    
    // Full update with new API key
    // ... existing logic
}
```

### 4. Updated Button State
**File**: `components/AISettingsManager.tsx`

```typescript
<button
    disabled={isSaving || (!tempApiKey.trim() && !settings?.isConfigured)}
>
    Save Settings
</button>
```

**Logic**:
- Disabled if: saving OR (no API key AND not configured)
- Enabled if: has API key OR already configured

---

## User Experience

### Before Fix:
```
1. User enters API key
2. Clicks "Save Settings"
3. Settings saved ✓
4. User closes modal
5. User reopens modal
6. API key field is EMPTY ❌
7. User thinks: "It didn't save!"
8. User re-enters API key again
```

### After Fix:
```
1. User enters API key
2. Clicks "Save Settings"
3. Settings saved ✓
4. User closes modal
5. User reopens modal
6. Sees: "✓ Saved" indicator
7. Sees: "API key is saved (enter new key to update)"
8. Sees: "🔒 Your API key is securely stored..."
9. User understands: "It's saved and secure!"
10. User can change model without re-entering key
```

---

## Use Cases

### Use Case 1: First Time Setup
1. Open AI Settings
2. Enter API key
3. Select model
4. Click "Save Settings"
5. ✅ Key saved, modal closes

### Use Case 2: Change Model Only
1. Open AI Settings
2. See "✓ Saved" indicator
3. Leave API key field empty
4. Change model selection
5. Click "Save Settings"
6. ✅ Model updated, key preserved

### Use Case 3: Update API Key
1. Open AI Settings
2. See "✓ Saved" indicator
3. Enter NEW API key
4. Click "Save Settings"
5. ✅ New key saved, old key replaced

---

## Security

### API Key Never Exposed:
- ✅ Stored in database
- ✅ Never returned to frontend
- ✅ Returns `***hidden***` instead
- ✅ Only Edge Functions can access it
- ✅ RLS policies protect access

### User Feedback:
- ✅ "✓ Saved" indicator shows it's stored
- ✅ Placeholder explains behavior
- ✅ Help text clarifies security
- ✅ No confusion about persistence

---

## Visual Changes

### API Key Field - Not Configured:
```
┌─────────────────────────────────────────┐
│ API Key                                 │
│ ┌─────────────────────────────────────┐ │
│ │ Enter your Gemini API key           │ │
│ └─────────────────────────────────────┘ │
│ Get your API key from Google AI Studio │
└─────────────────────────────────────────┘
```

### API Key Field - Configured:
```
┌─────────────────────────────────────────┐
│ API Key ✓ Saved                         │
│ ┌─────────────────────────────────────┐ │
│ │ API key is saved (enter new key...) │ │
│ └─────────────────────────────────────┘ │
│ 🔒 Your API key is securely stored.    │
│ Leave empty to keep current key, or    │
│ enter a new one to update.             │
└─────────────────────────────────────────┘
```

---

## Testing

### Test Scenario 1: First Save
1. ✅ Open AI Settings (not configured)
2. ✅ Enter API key
3. ✅ Select model
4. ✅ Click "Save Settings"
5. ✅ Success message appears
6. ✅ Modal closes

### Test Scenario 2: Reopen After Save
1. ✅ Open AI Settings (configured)
2. ✅ See "✓ Saved" indicator
3. ✅ API key field empty (expected)
4. ✅ Placeholder shows "API key is saved..."
5. ✅ Help text shows "🔒 Your API key is securely stored..."
6. ✅ Current Status shows "Configured"

### Test Scenario 3: Update Model Only
1. ✅ Open AI Settings (configured)
2. ✅ Leave API key field empty
3. ✅ Change model
4. ✅ Click "Save Settings" (enabled)
5. ✅ Success message appears
6. ✅ Model updated, key preserved

### Test Scenario 4: Update API Key
1. ✅ Open AI Settings (configured)
2. ✅ Enter new API key
3. ✅ Click "Save Settings"
4. ✅ Success message appears
5. ✅ New key saved

### Test Scenario 5: Test Connection
1. ✅ Open AI Settings (configured)
2. ✅ Leave API key empty
3. ✅ Click "Test Connection"
4. ✅ Should fail (no key in frontend)
5. ✅ Enter API key
6. ✅ Click "Test Connection"
7. ✅ Should succeed

---

## Database Behavior

### Scenario: Update Model Only
```sql
UPDATE ai_configurations
SET selected_model = 'gemini-2.5-pro',
    updated_at = NOW()
WHERE config_id = 'xxx';
-- encrypted_api_key remains unchanged
```

### Scenario: Update API Key
```sql
UPDATE ai_configurations
SET encrypted_api_key = 'new-key',
    selected_model = 'gemini-2.5-pro',
    is_configured = true,
    updated_at = NOW()
WHERE config_id = 'xxx';
```

---

## Benefits

### For Users:
- ✅ Clear feedback that key is saved
- ✅ No need to re-enter key every time
- ✅ Can update model without key
- ✅ Understands security model
- ✅ Less frustration

### For Security:
- ✅ API key never exposed to frontend
- ✅ Stored securely in database
- ✅ Only Edge Functions can access
- ✅ No change to security model
- ✅ Better UX without compromising security

### For Development:
- ✅ Cleaner code
- ✅ Better separation of concerns
- ✅ Partial update support
- ✅ More flexible API
- ✅ Better error handling

---

## Summary

**Problem**: API key appeared to "disappear" after saving, causing user confusion.

**Root Cause**: Security feature (not returning key to frontend) had poor UX.

**Solution**: Enhanced UI feedback and smart save logic to make security model clear while improving usability.

**Result**: Users understand their key is saved and secure, can update settings without re-entering key, and have a better overall experience.

**Security**: No changes to security model - API key still never exposed to frontend.
