import Console from '@alicloud/tea-console';
import Cas, * as $Cas from '@alicloud/cas20200407';
import Env from '@alicloud/darabonba-env';
import * as $OpenApi from '@alicloud/openapi-client';
import Util from '@alicloud/tea-util';
import Number from '@darabonba/number';
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

  // static async uploadCname(client: Cas, domain: string, cName: string): Promise<$Cas.put> {
  //   let request = new $Cas.UploadCnameRequest({});
  //   request.domain = domain;
  // }

  static async main(args: string[]): Promise<void> {
    // 初始化客户端
    let client = await Client.createClient();

    const domains = Env.getEnv('DOMAINS').split(',')
    const cdn_domains = Env.getEnv('ALIYUN_CDN_DOMAINS').split(',')

    // 上传证书
    // const uploadTasks = [];
    for (let i = 0; i < domains.length; i++) {
      const domain = domains[i]
      const cdn_domain = cdn_domains[i]

      let cert = ""
      let key = ""

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
      cert = fs.readFileSync(cert_path, "utf-8")
      key = fs.readFileSync(key_path, "utf-8")

      // 上传证书
      await Client.uploadUserCertificate(client, cdn_domain, cert, key, "", "", "", "")

      // 证书详情 获取CertIdentifier
      // const certDetailRes = await Client.GetUserCertificateDetail(client, certId)
      // 上传CNAME 接口只支持java的sdk
      // putCname <https://api.aliyun.com/api/Oss/2019-05-17/PutCname?sdkStyle=dara>
    }
  }

}

Client.main(process.argv.slice(2));