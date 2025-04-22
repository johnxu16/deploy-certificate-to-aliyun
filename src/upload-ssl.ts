import Console from '@alicloud/tea-console';
import Cas, * as $Cas from '@alicloud/cas20200407';
import Env from '@alicloud/darabonba-env';
import * as $OpenApi from '@alicloud/openapi-client';
import Util from '@alicloud/tea-util';
import * as $tea from '@alicloud/tea-typescript';
import path from 'path';
import * as fs from 'fs';
import os from 'os';


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

  static async listUserCertificateOrder(client: Cas, keyword: string, orderType: string): Promise<$Cas.ListUserCertificateOrderResponse> {
    let request = new $Cas.ListUserCertificateOrderRequest({});
    request.keyword = keyword;
    request.orderType = orderType;
    request.showSize = 1;
    let response = await client.listUserCertificateOrder(request);
    Console.log(Util.toJSONString($tea.toMap(response.body)));
    return response;
  }

  static async GetUserCertificateDetail(client: Cas, certId: number): Promise<$Cas.GetUserCertificateDetailResponse> {
    let request = new $Cas.GetUserCertificateDetailRequest({});
    request.certId = certId;
    let response = await client.getUserCertificateDetail(request);
    Console.log(Util.toJSONString($tea.toMap(response.body)));
    return response;
  }

  static async main(args: string[]): Promise<void> {
    // 初始化客户端
    let client = await Client.createClient();

    const region = Env.getEnv('REGION')
    const domain = Env.getEnv('DOMAIN')
    const cdn_domain = Env.getEnv('ALIYUN_CDN_DOMAIN')

    // 上传证书
    // 读取证书并删除同名证书
    const certListRes = await Client.listUserCertificateOrder(client, domain, "UPLOAD")
    if (certListRes.body.certificateOrderList.length === 1 && certListRes.body.certificateOrderList[0].name === cdn_domain) {
      const certId = certListRes.body.certificateOrderList[0].certificateId
      await Client.deleteUserCertificate(client, certId)
    }

    const homepath = os.homedir()
    const cert_path = path.resolve(homepath, `./certs/${domain}/fullchain.pem`)
    const key_path = path.resolve(homepath, `./certs/${domain}/privkey.pem`)

    Console.log(`${cdn_domain} ${cert_path} ${key_path}`)

    // 读取证书和私钥
    const cert = fs.readFileSync(cert_path, "utf-8")
    const key = fs.readFileSync(key_path, "utf-8")

    // 上传证书
    const certRes = await Client.uploadUserCertificate(client, cdn_domain, cert, key, "", "", "", "")
    const certId = certRes.body.certId

    // 创建OSS CNAME请求
    const xmlRequest = `
<?xml version="1.0" encoding="utf-8"?>
<BucketCnameConfiguration>
  <Cname>
    <Domain>${cdn_domain}</Domain>
    <CertificateConfiguration>
      <CertId>${certId}-${region}</CertId>
      <Certificate>${cert}</Certificate>
      <PrivateKey>${key}</PrivateKey>
      <Force>true</Force>
    </CertificateConfiguration>
  </Cname>
</BucketCnameConfiguration>`
    Console.log(xmlRequest)

    const oss_cname_path = path.resolve(homepath, `./certs/${domain}/oss_cname.xml`)
    Console.log(`path: ${oss_cname_path}`)

    fs.writeFileSync(oss_cname_path, xmlRequest)
  }

}

Client.main(process.argv.slice(2));