from abc import ABC, abstractmethod


class TranslationProvider(ABC):
    name: str

    @abstractmethod
    async def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        raise NotImplementedError
