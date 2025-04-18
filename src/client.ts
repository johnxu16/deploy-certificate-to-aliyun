import Console from '@alicloud/tea-console';
import Cas, * as $Cas from '@alicloud/cas20200407';
import Env from '@alicloud/darabonba-env';
import * as $OpenApi from '@alicloud/openapi-client';
import Util from '@alicloud/tea-util';
import * as $tea from '@alicloud/tea-typescript';
import * as fs from 'fs';


export default class Client {

  /**
   * createClient  创建客户端
   */
  static async createClient(): Promise<Cas> {
    let config = new $OpenApi.Config({});
    // 您账号所属的AccessKey ID
    config.accessKeyId = Env.getEnv("ALIYUN_ACCESS_KEY_ID");
    // 您账号所属的AccessKey Secret
    config.accessKeySecret = Env.getEnv("ALIYUN_ACCESS_KEY_SECRET");
    config.endpoint = "cas.aliyuncs.com";
    return new Cas(config);
  }

  static async uploadUserCertificate(client: Cas, name: string, cert: string, key: string, encryptCert: string, encryptPrivateKey: string, signCert: string, signPrivateKey: string): Promise<$Cas.UploadUserCertificateResponse> {
    let request = new $Cas.UploadUserCertificateRequest({});
    request.name = name;
    request.cert = cert;
    request.key = key;
    request.encryptCert = encryptCert;
    request.encryptPrivateKey = encryptPrivateKey;
    request.signCert = signCert;
    request.signPrivateKey = signPrivateKey;
    let response = await client.uploadUserCertificate(request);
    Console.log(Util.toJSONString($tea.toMap(response.body)));
    return response;
  }

  static async deleteUserCertificate(client: Cas, certId: number): Promise<$Cas.DeleteUserCertificateResponse> {
    let request = new $Cas.DeleteUserCertificateRequest({});
    request.certId = certId;
    let response = await client.deleteUserCertificate(request);
    Console.log(Util.toJSONString($tea.toMap(response.body)));
    return response;
  }

  static async getUserCertificateDetail(client: Cas, certId: number): Promise<$Cas.GetUserCertificateDetailResponse> {
    let request = new $Cas.GetUserCertificateDetailRequest({});
    request.certId = certId;
    let response = await client.getUserCertificateDetail(request);
    Console.log(Util.toJSONString($tea.toMap(response.body)));
    return response;
  }

  static async getFileByPath() {

  }

  static async main(args: string[]): Promise<void> {
    // 初始化客户端
    let client = await Client.createClient();

    // let name = args[0];
    // let cert = args[1];
    // let key = args[2];
    // 不使用国密证书
    // let encryptCert = args[3];
    // let encryptPrivateKey = args[4];
    // let signCert = args[5];
    // let signPrivateKey = args[6];
    const domains = Env.getEnv('DOMAINS').split(',')
    const cdn_domains = Env.getEnv('ALIYUN_CDN_DOMAINS').split(',')

    const uploadTasks = [];
    for (let i = 0; i < domains.length; i++) {
      const domain = domains[i]
      const cdn_domain = cdn_domains[i]

      const cert_path = `~/certs/${domain}/fullchain.pem`
      const key_path = `~/certs/${domain}/privkey.pem`

      Console.log(`${cdn_domain} ${cert_path} ${key_path}`);

      // 读取证书和私钥
      const cert = fs.readFileSync(cert_path, "utf-8");
      const key = fs.readFileSync(key_path, "utf-8");

      // 上传证书
      uploadTasks.push(Client.uploadUserCertificate(client, cdn_domain, cert, key, "", "", "", ""));
    }

    // 统一上传证书
    const responses = await Promise.all(uploadTasks)
    Console.log(responses.toString())

    // let certId = Number.parseLong(args[7]);
    // 获取证书
    // let response1 = await Client.getUserCertificateDetail(client, certId);
    // 删除证书
    // let response2 = await Client.deleteUserCertificate(client, certId);
  }

}

Client.main(process.argv.slice(2));