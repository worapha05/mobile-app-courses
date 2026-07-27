import {
  AndroidConfig,
  ConfigPlugin,
  withInfoPlist,
  withAndroidManifest,
} from 'expo/config-plugins';

type Props = {
  partnerId?: string;
};

/**
 * ปลั๊กอินตัวอย่าง: ใส่ metadata ฝั่ง iOS/Android ตอน prebuild
 * ใช้งาน: plugins: [['./plugins/withPartnerMetadata', { partnerId: 'acme' }]]
 */
const withPartnerMetadata: ConfigPlugin<Props | void> = (config, props) => {
  const partnerId = props?.partnerId ?? 'bootcamp';

  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.FieldShelfPartnerId = partnerId;
    return cfg;
  });

  config = withAndroidManifest(config, (cfg) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'com.fieldshelf.PARTNER_ID',
      partnerId,
    );
    return cfg;
  });

  return config;
};

export default withPartnerMetadata;
