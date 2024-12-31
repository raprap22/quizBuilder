import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { Select } from 'antd';
interface LanguageSwitcherProps {
  borderless?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ borderless }) => {
  const { i18n } = useTranslation();
  const router = useRouter();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang).then(() => {
      router.push(router.pathname, router.asPath, { locale: lang });
    });
  };

  const languageOptions = [
    { value: 'en-US', label: 'English' },
    { value: 'ar', label: 'العربية' },
  ];

  return (
    <div className="flex justify-end">
      <Select
        defaultValue={i18n.language}
        onChange={changeLanguage}
        options={languageOptions}
        className="w-40"
        dropdownClassName="text-center"
        variant={borderless ? 'borderless' : 'outlined'}
      />
    </div>
  );
};

export default LanguageSwitcher;
