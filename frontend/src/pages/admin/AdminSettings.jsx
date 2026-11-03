import { useState } from 'react';
import { Settings, Save, DollarSign, Truck, Percent, Bell, Shield, Globe, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULTS = {
  platformFee: 5,
  taxRate: 5,
  defaultDeliveryFee: 30,
  minOrderValue: 100,
  maxDeliveryRadius: 15,
  freeDeliveryAbove: 500,
  orderCancelWindow: 5,
  supportEmail: 'support@foodrush.in',
  supportPhone: '+91 98765 43210',
  siteName: 'FoodRush',
  maintenanceMode: false,
  allowGuestCheckout: false,
  autoConfirmOrders: false,
  emailNotifications: true,
  smsNotifications: false,
};

function SettingSection({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="w-8 h-8 bg-primary-100 rounded-xl flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary-600" />
        </div>
        <h3 className="font-display font-bold text-gray-900">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function NumberField({ label, value, onChange, prefix, suffix, min = 0, step = 1, hint }) {
  return (
    <div>
      <label className="label text-xs">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">{prefix}</span>}
        <input
          type="number"
          min={min}
          step={step}
          className={`input-field text-sm py-2.5 ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-12' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{suffix}</span>}
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function ToggleField({ label, description, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${value ? 'bg-primary-500' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

export default function AdminSettings() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);

  const set = (key) => (val) => setSettings(s => ({ ...s, [key]: val }));

  const handleSave = () => {
    // In a real app, this would call an API endpoint
    toast.success('Settings saved successfully!');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary-500" /> Settings
          </h1>
          <p className="text-gray-400 text-xs mt-0.5">Configure your FoodRush platform parameters</p>
        </div>
        <button
          onClick={handleSave}
          className={`btn-primary py-2 px-5 text-sm flex items-center gap-2 transition-all ${saved ? 'bg-green-500 hover:bg-green-600' : ''}`}
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Pricing Settings */}
      <SettingSection title="Pricing & Fees" icon={DollarSign}>
        <div className="grid grid-cols-2 gap-4">
          <NumberField label="Platform Fee (₹)" value={settings.platformFee} onChange={set('platformFee')} prefix="₹" hint="Charged per order" />
          <NumberField label="Tax Rate (%)" value={settings.taxRate} onChange={set('taxRate')} suffix="%" min={0} max={100} hint="GST applied on subtotal" />
          <NumberField label="Default Delivery Fee (₹)" value={settings.defaultDeliveryFee} onChange={set('defaultDeliveryFee')} prefix="₹" />
          <NumberField label="Free Delivery Above (₹)" value={settings.freeDeliveryAbove} onChange={set('freeDeliveryAbove')} prefix="₹" hint="Set 0 to disable" />
          <NumberField label="Minimum Order Value (₹)" value={settings.minOrderValue} onChange={set('minOrderValue')} prefix="₹" />
        </div>
      </SettingSection>

      {/* Delivery Settings */}
      <SettingSection title="Delivery" icon={Truck}>
        <div className="grid grid-cols-2 gap-4">
          <NumberField label="Max Delivery Radius (km)" value={settings.maxDeliveryRadius} onChange={set('maxDeliveryRadius')} suffix="km" min={1} max={50} />
          <NumberField label="Order Cancel Window (min)" value={settings.orderCancelWindow} onChange={set('orderCancelWindow')} suffix="min" min={0} hint="Minutes after order to allow cancellation" />
        </div>
      </SettingSection>

      {/* Platform Settings */}
      <SettingSection title="Platform" icon={Globe}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label text-xs">Site Name</label>
            <input className="input-field text-sm py-2.5" value={settings.siteName} onChange={e => set('siteName')(e.target.value)} />
          </div>
          <div>
            <label className="label text-xs">Support Email</label>
            <input type="email" className="input-field text-sm py-2.5" value={settings.supportEmail} onChange={e => set('supportEmail')(e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="label text-xs">Support Phone</label>
            <input className="input-field text-sm py-2.5" value={settings.supportPhone} onChange={e => set('supportPhone')(e.target.value)} />
          </div>
        </div>
        <div className="space-y-0">
          <ToggleField label="Maintenance Mode" description="Disable the site for all non-admin users" value={settings.maintenanceMode} onChange={set('maintenanceMode')} />
          <ToggleField label="Allow Guest Checkout" description="Let users order without creating an account" value={settings.allowGuestCheckout} onChange={set('allowGuestCheckout')} />
          <ToggleField label="Auto-Confirm Orders" description="Automatically confirm orders without manual review" value={settings.autoConfirmOrders} onChange={set('autoConfirmOrders')} />
        </div>
      </SettingSection>

      {/* Notifications */}
      <SettingSection title="Notifications" icon={Bell}>
        <div className="space-y-0">
          <ToggleField label="Email Notifications" description="Send email alerts for new orders, status changes" value={settings.emailNotifications} onChange={set('emailNotifications')} />
          <ToggleField label="SMS Notifications" description="Send SMS alerts to customers for order updates" value={settings.smsNotifications} onChange={set('smsNotifications')} />
        </div>
      </SettingSection>

      {/* System Info */}
      <SettingSection title="System Information" icon={Shield}>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Current Tax Rate', value: `${settings.taxRate}% GST` },
            { label: 'Platform Fee', value: `₹${settings.platformFee} per order` },
            { label: 'Default Delivery', value: `₹${settings.defaultDeliveryFee}` },
            { label: 'JWT Expiry', value: '7 days' },
            { label: 'API Version', value: 'v1.0.0' },
            { label: 'Environment', value: 'Development' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="font-semibold text-gray-900 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </SettingSection>
    </div>
  );
}
