import {
  AndroidConfig,
  ConfigPlugin,
  withAndroidManifest,
  withInfoPlist,
} from 'expo/config-plugins';

const withPartnerMetadata: ConfigPlugin<{ partnerId?: string } | void> = (config, props) => {
  const partnerId = props?.partnerId ?? 'stockpulse';

  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.StockPulsePartnerId = partnerId;
    return cfg;
  });

  config = withAndroidManifest(config, (cfg) => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      application,
      'com.stockpulse.PARTNER_ID',
      partnerId,
    );
    return cfg;
  });

  return config;
};

export default withPartnerMetadata;
