"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tea_console_1 = __importDefault(require("@alicloud/tea-console"));
const cas20200407_1 = __importStar(require("@alicloud/cas20200407")), $Cas = cas20200407_1;
const darabonba_env_1 = __importDefault(require("@alicloud/darabonba-env"));
const $OpenApi = __importStar(require("@alicloud/openapi-client"));
const tea_util_1 = __importDefault(require("@alicloud/tea-util"));
const $tea = __importStar(require("@alicloud/tea-typescript"));
class Client {
    /**
     * createClient  创建客户端
     */
    static async createClient() {
        let config = new $OpenApi.Config({});
        // 您账号所属的AccessKey ID
        config.accessKeyId = darabonba_env_1.default.getEnv("ALIYUN_ACCESS_KEY_ID");
        // 您账号所属的AccessKey Secret
        config.accessKeySecret = darabonba_env_1.default.getEnv("ALIYUN_ACCESS_KEY_SECRET");
        config.endpoint = "cas.aliyuncs.com";
        return new cas20200407_1.default(config);
    }
    static async uploadUserCertificate(client, name, cert, key, encryptCert, encryptPrivateKey, signCert, signPrivateKey) {
        let request = new $Cas.UploadUserCertificateRequest({});
        request.name = name;
        request.cert = cert;
        request.key = key;
        request.encryptCert = encryptCert;
        request.encryptPrivateKey = encryptPrivateKey;
        request.signCert = signCert;
        request.signPrivateKey = signPrivateKey;
        let response = await client.uploadUserCertificate(request);
        tea_console_1.default.log(tea_util_1.default.toJSONString($tea.toMap(response.body)));
        return response;
    }
    static async deleteUserCertificate(client, certId) {
        let request = new $Cas.DeleteUserCertificateRequest({});
        request.certId = certId;
        let response = await client.deleteUserCertificate(request);
        tea_console_1.default.log(tea_util_1.default.toJSONString($tea.toMap(response.body)));
        return response;
    }
    static async getUserCertificateDetail(client, certId) {
        let request = new $Cas.GetUserCertificateDetailRequest({});
        request.certId = certId;
        let response = await client.getUserCertificateDetail(request);
        tea_console_1.default.log(tea_util_1.default.toJSONString($tea.toMap(response.body)));
        return response;
    }
    static async getFileByPath() {
    }
    static async main(args) {
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
        const domains = darabonba_env_1.default.getEnv('DOMAINS').split(',');
        const cdn_domains = darabonba_env_1.default.getEnv('ALIYUN_CDN_DOMAINS').split(',');
        const uploadTasks = [];
        for (let i = 0; i < domains.length; i++) {
            const domain = domains[i];
            const cdn_domain = cdn_domains[i];
            const cert_path = `~/certs/${domain}/fullchain.pem`;
            const key_path = `~/certs/${domain}/privkey.pem`;
            tea_console_1.default.log(`${cdn_domain} ${cert_path} ${key_path}`);
            const cert = darabonba_env_1.default.getEnv(`${domain}_CERT`);
            const key = darabonba_env_1.default.getEnv(`${domain}_KEY`);
            uploadTasks.push(Client.uploadUserCertificate(client, cdn_domain, cert, key, "", "", "", ""));
        }
        // 上传证书
        const responses = await Promise.all(uploadTasks);
        // if (response.body.code == "200") {
        //   Console.log("上传证书成功");
        // } else {
        //   throw new Error("上传证书失败");
        // }
        // let certId = Number.parseLong(args[7]);
        // 获取证书
        // let response1 = await Client.getUserCertificateDetail(client, certId);
        // 删除证书
        // let response2 = await Client.deleteUserCertificate(client, certId);
    }
}
exports.default = Client;
Client.main(process.argv.slice(2));
//# sourceMappingURL=client.js.map