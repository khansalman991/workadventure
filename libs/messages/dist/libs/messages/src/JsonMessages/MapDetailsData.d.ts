import { z } from "zod";
declare const isBbbData: z.ZodObject<{
    url: z.ZodString;
    secret: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    url: string;
    secret?: string | null | undefined;
}, {
    url: string;
    secret?: string | null | undefined;
}>;
declare const isJitsiData: z.ZodObject<{
    url: z.ZodString;
    iss: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    secret: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    url: string;
    iss?: string | null | undefined;
    secret?: string | null | undefined;
}, {
    url: string;
    iss?: string | null | undefined;
    secret?: string | null | undefined;
}>;
declare const isMapThirdPartyData: z.ZodObject<{
    bbb: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        url: z.ZodString;
        secret: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        url: string;
        secret?: string | null | undefined;
    }, {
        url: string;
        secret?: string | null | undefined;
    }>>>;
    jitsi: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        url: z.ZodString;
        iss: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        secret: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        url: string;
        iss?: string | null | undefined;
        secret?: string | null | undefined;
    }, {
        url: string;
        iss?: string | null | undefined;
        secret?: string | null | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    bbb?: {
        url: string;
        secret?: string | null | undefined;
    } | null | undefined;
    jitsi?: {
        url: string;
        iss?: string | null | undefined;
        secret?: string | null | undefined;
    } | null | undefined;
}, {
    bbb?: {
        url: string;
        secret?: string | null | undefined;
    } | null | undefined;
    jitsi?: {
        url: string;
        iss?: string | null | undefined;
        secret?: string | null | undefined;
    } | null | undefined;
}>;
declare const MetaTagsData: z.ZodObject<{
    title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    description: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    author: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    provider: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    favIcons: z.ZodOptional<z.ZodArray<z.ZodObject<{
        rel: z.ZodString;
        sizes: z.ZodString;
        src: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        rel: string;
        sizes: string;
        src: string;
    }, {
        rel: string;
        sizes: string;
        src: string;
    }>, "many">>;
    manifestIcons: z.ZodOptional<z.ZodArray<z.ZodObject<{
        sizes: z.ZodString;
        src: z.ZodString;
        type: z.ZodOptional<z.ZodString>;
        purpose: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        sizes: string;
        src: string;
        type?: string | undefined;
        purpose?: string | undefined;
    }, {
        sizes: string;
        src: string;
        type?: string | undefined;
        purpose?: string | undefined;
    }>, "many">>;
    appName: z.ZodOptional<z.ZodString>;
    shortAppName: z.ZodOptional<z.ZodString>;
    themeColor: z.ZodOptional<z.ZodString>;
    cardImage: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description: string;
    title: string;
    author: string;
    provider: string;
    favIcons?: {
        rel: string;
        sizes: string;
        src: string;
    }[] | undefined;
    manifestIcons?: {
        sizes: string;
        src: string;
        type?: string | undefined;
        purpose?: string | undefined;
    }[] | undefined;
    appName?: string | undefined;
    shortAppName?: string | undefined;
    themeColor?: string | undefined;
    cardImage?: string | undefined;
}, {
    description?: string | undefined;
    title?: string | undefined;
    author?: string | undefined;
    provider?: string | undefined;
    favIcons?: {
        rel: string;
        sizes: string;
        src: string;
    }[] | undefined;
    manifestIcons?: {
        sizes: string;
        src: string;
        type?: string | undefined;
        purpose?: string | undefined;
    }[] | undefined;
    appName?: string | undefined;
    shortAppName?: string | undefined;
    themeColor?: string | undefined;
    cardImage?: string | undefined;
}>;
declare const RequiredMetaTagsData: z.ZodObject<{
    title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    description: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    author: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    provider: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    favIcons: z.ZodArray<z.ZodObject<{
        rel: z.ZodString;
        sizes: z.ZodString;
        src: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        rel: string;
        sizes: string;
        src: string;
    }, {
        rel: string;
        sizes: string;
        src: string;
    }>, "many">;
    manifestIcons: z.ZodArray<z.ZodObject<{
        sizes: z.ZodString;
        src: z.ZodString;
        type: z.ZodOptional<z.ZodString>;
        purpose: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        sizes: string;
        src: string;
        type?: string | undefined;
        purpose?: string | undefined;
    }, {
        sizes: string;
        src: string;
        type?: string | undefined;
        purpose?: string | undefined;
    }>, "many">;
    appName: z.ZodString;
    shortAppName: z.ZodString;
    themeColor: z.ZodString;
    cardImage: z.ZodString;
}, "strip", z.ZodTypeAny, {
    description: string;
    title: string;
    author: string;
    provider: string;
    favIcons: {
        rel: string;
        sizes: string;
        src: string;
    }[];
    manifestIcons: {
        sizes: string;
        src: string;
        type?: string | undefined;
        purpose?: string | undefined;
    }[];
    appName: string;
    shortAppName: string;
    themeColor: string;
    cardImage: string;
}, {
    favIcons: {
        rel: string;
        sizes: string;
        src: string;
    }[];
    manifestIcons: {
        sizes: string;
        src: string;
        type?: string | undefined;
        purpose?: string | undefined;
    }[];
    appName: string;
    shortAppName: string;
    themeColor: string;
    cardImage: string;
    description?: string | undefined;
    title?: string | undefined;
    author?: string | undefined;
    provider?: string | undefined;
}>;
declare const isLegalsData: z.ZodObject<{
    termsOfUseUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    privacyPolicyUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    cookiePolicyUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    termsOfUseUrl?: string | null | undefined;
    privacyPolicyUrl?: string | null | undefined;
    cookiePolicyUrl?: string | null | undefined;
}, {
    termsOfUseUrl?: string | null | undefined;
    privacyPolicyUrl?: string | null | undefined;
    cookiePolicyUrl?: string | null | undefined;
}>;
declare const CustomizeSceneData: z.ZodObject<{
    clothesIcon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    accessoryIcon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    hatIcon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    hairIcon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    eyesIcon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    bodyIcon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    turnIcon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    clothesIcon?: string | null | undefined;
    accessoryIcon?: string | null | undefined;
    hatIcon?: string | null | undefined;
    hairIcon?: string | null | undefined;
    eyesIcon?: string | null | undefined;
    bodyIcon?: string | null | undefined;
    turnIcon?: string | null | undefined;
}, {
    clothesIcon?: string | null | undefined;
    accessoryIcon?: string | null | undefined;
    hatIcon?: string | null | undefined;
    hairIcon?: string | null | undefined;
    eyesIcon?: string | null | undefined;
    bodyIcon?: string | null | undefined;
    turnIcon?: string | null | undefined;
}>;
export declare const isMapDetailsData: z.ZodObject<{
    mapUrl: z.ZodOptional<z.ZodString>;
    wamUrl: z.ZodOptional<z.ZodString>;
    authenticationMandatory: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    group: z.ZodNullable<z.ZodString>;
    contactPage: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    opidLogoutRedirectUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    opidWokaNamePolicy: z.ZodOptional<z.ZodNullable<z.ZodNullable<z.ZodOptional<z.ZodEnum<["user_input", "allow_override_opid", "force_opid", ""]>>>>>;
    expireOn: z.ZodOptional<z.ZodString>;
    canReport: z.ZodOptional<z.ZodBoolean>;
    editable: z.ZodOptional<z.ZodBoolean>;
    loadingLogo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    loginSceneLogo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    backgroundSceneImage: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    showPoweredBy: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    thirdParty: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        bbb: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            url: z.ZodString;
            secret: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            url: string;
            secret?: string | null | undefined;
        }, {
            url: string;
            secret?: string | null | undefined;
        }>>>;
        jitsi: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            url: z.ZodString;
            iss: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            secret: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            url: string;
            iss?: string | null | undefined;
            secret?: string | null | undefined;
        }, {
            url: string;
            iss?: string | null | undefined;
            secret?: string | null | undefined;
        }>>>;
    }, "strip", z.ZodTypeAny, {
        bbb?: {
            url: string;
            secret?: string | null | undefined;
        } | null | undefined;
        jitsi?: {
            url: string;
            iss?: string | null | undefined;
            secret?: string | null | undefined;
        } | null | undefined;
    }, {
        bbb?: {
            url: string;
            secret?: string | null | undefined;
        } | null | undefined;
        jitsi?: {
            url: string;
            iss?: string | null | undefined;
            secret?: string | null | undefined;
        } | null | undefined;
    }>>>;
    metadata: z.ZodOptional<z.ZodUnknown>;
    roomName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    pricingUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    enableMatrixChat: z.ZodOptional<z.ZodBoolean>;
    enableChat: z.ZodOptional<z.ZodBoolean>;
    enableChatUpload: z.ZodOptional<z.ZodBoolean>;
    enableChatOnlineList: z.ZodOptional<z.ZodBoolean>;
    enableChatDisconnectedList: z.ZodOptional<z.ZodBoolean>;
    enableSay: z.ZodOptional<z.ZodBoolean>;
    enableIssueReport: z.ZodOptional<z.ZodBoolean>;
    metatags: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        title: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        description: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        author: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        provider: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        favIcons: z.ZodOptional<z.ZodArray<z.ZodObject<{
            rel: z.ZodString;
            sizes: z.ZodString;
            src: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            rel: string;
            sizes: string;
            src: string;
        }, {
            rel: string;
            sizes: string;
            src: string;
        }>, "many">>;
        manifestIcons: z.ZodOptional<z.ZodArray<z.ZodObject<{
            sizes: z.ZodString;
            src: z.ZodString;
            type: z.ZodOptional<z.ZodString>;
            purpose: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            sizes: string;
            src: string;
            type?: string | undefined;
            purpose?: string | undefined;
        }, {
            sizes: string;
            src: string;
            type?: string | undefined;
            purpose?: string | undefined;
        }>, "many">>;
        appName: z.ZodOptional<z.ZodString>;
        shortAppName: z.ZodOptional<z.ZodString>;
        themeColor: z.ZodOptional<z.ZodString>;
        cardImage: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        title: string;
        author: string;
        provider: string;
        favIcons?: {
            rel: string;
            sizes: string;
            src: string;
        }[] | undefined;
        manifestIcons?: {
            sizes: string;
            src: string;
            type?: string | undefined;
            purpose?: string | undefined;
        }[] | undefined;
        appName?: string | undefined;
        shortAppName?: string | undefined;
        themeColor?: string | undefined;
        cardImage?: string | undefined;
    }, {
        description?: string | undefined;
        title?: string | undefined;
        author?: string | undefined;
        provider?: string | undefined;
        favIcons?: {
            rel: string;
            sizes: string;
            src: string;
        }[] | undefined;
        manifestIcons?: {
            sizes: string;
            src: string;
            type?: string | undefined;
            purpose?: string | undefined;
        }[] | undefined;
        appName?: string | undefined;
        shortAppName?: string | undefined;
        themeColor?: string | undefined;
        cardImage?: string | undefined;
    }>>>;
    legals: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        termsOfUseUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        privacyPolicyUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        cookiePolicyUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        termsOfUseUrl?: string | null | undefined;
        privacyPolicyUrl?: string | null | undefined;
        cookiePolicyUrl?: string | null | undefined;
    }, {
        termsOfUseUrl?: string | null | undefined;
        privacyPolicyUrl?: string | null | undefined;
        cookiePolicyUrl?: string | null | undefined;
    }>>>;
    customizeWokaScene: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        clothesIcon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        accessoryIcon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        hatIcon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        hairIcon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        eyesIcon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        bodyIcon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        turnIcon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        clothesIcon?: string | null | undefined;
        accessoryIcon?: string | null | undefined;
        hatIcon?: string | null | undefined;
        hairIcon?: string | null | undefined;
        eyesIcon?: string | null | undefined;
        bodyIcon?: string | null | undefined;
        turnIcon?: string | null | undefined;
    }, {
        clothesIcon?: string | null | undefined;
        accessoryIcon?: string | null | undefined;
        hatIcon?: string | null | undefined;
        hairIcon?: string | null | undefined;
        eyesIcon?: string | null | undefined;
        bodyIcon?: string | null | undefined;
        turnIcon?: string | null | undefined;
    }>>>;
    backgroundColor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    primaryColor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    reportIssuesUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    entityCollectionsUrls: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    errorSceneLogo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    modules: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    isLogged: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    group: string | null;
    isLogged?: boolean | undefined;
    roomName?: string | null | undefined;
    mapUrl?: string | undefined;
    wamUrl?: string | undefined;
    authenticationMandatory?: boolean | null | undefined;
    contactPage?: string | null | undefined;
    opidLogoutRedirectUrl?: string | null | undefined;
    opidWokaNamePolicy?: "" | "user_input" | "allow_override_opid" | "force_opid" | null | undefined;
    expireOn?: string | undefined;
    canReport?: boolean | undefined;
    editable?: boolean | undefined;
    loadingLogo?: string | null | undefined;
    loginSceneLogo?: string | null | undefined;
    backgroundSceneImage?: string | null | undefined;
    showPoweredBy?: boolean | null | undefined;
    thirdParty?: {
        bbb?: {
            url: string;
            secret?: string | null | undefined;
        } | null | undefined;
        jitsi?: {
            url: string;
            iss?: string | null | undefined;
            secret?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
    metadata?: unknown;
    pricingUrl?: string | null | undefined;
    enableMatrixChat?: boolean | undefined;
    enableChat?: boolean | undefined;
    enableChatUpload?: boolean | undefined;
    enableChatOnlineList?: boolean | undefined;
    enableChatDisconnectedList?: boolean | undefined;
    enableSay?: boolean | undefined;
    enableIssueReport?: boolean | undefined;
    metatags?: {
        description: string;
        title: string;
        author: string;
        provider: string;
        favIcons?: {
            rel: string;
            sizes: string;
            src: string;
        }[] | undefined;
        manifestIcons?: {
            sizes: string;
            src: string;
            type?: string | undefined;
            purpose?: string | undefined;
        }[] | undefined;
        appName?: string | undefined;
        shortAppName?: string | undefined;
        themeColor?: string | undefined;
        cardImage?: string | undefined;
    } | null | undefined;
    legals?: {
        termsOfUseUrl?: string | null | undefined;
        privacyPolicyUrl?: string | null | undefined;
        cookiePolicyUrl?: string | null | undefined;
    } | null | undefined;
    customizeWokaScene?: {
        clothesIcon?: string | null | undefined;
        accessoryIcon?: string | null | undefined;
        hatIcon?: string | null | undefined;
        hairIcon?: string | null | undefined;
        eyesIcon?: string | null | undefined;
        bodyIcon?: string | null | undefined;
        turnIcon?: string | null | undefined;
    } | null | undefined;
    backgroundColor?: string | null | undefined;
    primaryColor?: string | null | undefined;
    reportIssuesUrl?: string | null | undefined;
    entityCollectionsUrls?: string[] | null | undefined;
    errorSceneLogo?: string | null | undefined;
    modules?: string[] | null | undefined;
}, {
    group: string | null;
    isLogged?: boolean | undefined;
    roomName?: string | null | undefined;
    mapUrl?: string | undefined;
    wamUrl?: string | undefined;
    authenticationMandatory?: boolean | null | undefined;
    contactPage?: string | null | undefined;
    opidLogoutRedirectUrl?: string | null | undefined;
    opidWokaNamePolicy?: "" | "user_input" | "allow_override_opid" | "force_opid" | null | undefined;
    expireOn?: string | undefined;
    canReport?: boolean | undefined;
    editable?: boolean | undefined;
    loadingLogo?: string | null | undefined;
    loginSceneLogo?: string | null | undefined;
    backgroundSceneImage?: string | null | undefined;
    showPoweredBy?: boolean | null | undefined;
    thirdParty?: {
        bbb?: {
            url: string;
            secret?: string | null | undefined;
        } | null | undefined;
        jitsi?: {
            url: string;
            iss?: string | null | undefined;
            secret?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
    metadata?: unknown;
    pricingUrl?: string | null | undefined;
    enableMatrixChat?: boolean | undefined;
    enableChat?: boolean | undefined;
    enableChatUpload?: boolean | undefined;
    enableChatOnlineList?: boolean | undefined;
    enableChatDisconnectedList?: boolean | undefined;
    enableSay?: boolean | undefined;
    enableIssueReport?: boolean | undefined;
    metatags?: {
        description?: string | undefined;
        title?: string | undefined;
        author?: string | undefined;
        provider?: string | undefined;
        favIcons?: {
            rel: string;
            sizes: string;
            src: string;
        }[] | undefined;
        manifestIcons?: {
            sizes: string;
            src: string;
            type?: string | undefined;
            purpose?: string | undefined;
        }[] | undefined;
        appName?: string | undefined;
        shortAppName?: string | undefined;
        themeColor?: string | undefined;
        cardImage?: string | undefined;
    } | null | undefined;
    legals?: {
        termsOfUseUrl?: string | null | undefined;
        privacyPolicyUrl?: string | null | undefined;
        cookiePolicyUrl?: string | null | undefined;
    } | null | undefined;
    customizeWokaScene?: {
        clothesIcon?: string | null | undefined;
        accessoryIcon?: string | null | undefined;
        hatIcon?: string | null | undefined;
        hairIcon?: string | null | undefined;
        eyesIcon?: string | null | undefined;
        bodyIcon?: string | null | undefined;
        turnIcon?: string | null | undefined;
    } | null | undefined;
    backgroundColor?: string | null | undefined;
    primaryColor?: string | null | undefined;
    reportIssuesUrl?: string | null | undefined;
    entityCollectionsUrls?: string[] | null | undefined;
    errorSceneLogo?: string | null | undefined;
    modules?: string[] | null | undefined;
}>;
export type MapDetailsData = z.infer<typeof isMapDetailsData>;
export type MapThirdPartyData = z.infer<typeof isMapThirdPartyData>;
export type MapBbbData = z.infer<typeof isBbbData>;
export type MapJitsiData = z.infer<typeof isJitsiData>;
export type MetaTagsData = z.infer<typeof MetaTagsData>;
export type RequiredMetaTagsData = z.infer<typeof RequiredMetaTagsData>;
export type LegalsData = z.infer<typeof isLegalsData>;
export type CustomizeSceneData = z.infer<typeof CustomizeSceneData>;
export {};
