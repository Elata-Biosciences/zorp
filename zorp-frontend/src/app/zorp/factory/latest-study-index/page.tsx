'use client';

import { useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { abi as zorpFactoryAbi } from 'abi/IZorpFactory.json';

export default function ZorpFactoryReadLatestStudyIndex() {
  const addressFactoryAnvil = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
  const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
  const addressFactoryId = useId();

  const { data: latest_study_index, isFetching } = useReadContract({
    address: addressFactory,
    abi: zorpFactoryAbi,
    functionName: 'latest_study_index',
    args: [],
    query: {
      enabled: addressFactory.length === addressFactoryAnvil.length
            && addressFactory.startsWith('0x'),
    },
  });

  return (
    <>
      <label htmlFor={addressFactoryId}>ZORP Factory Address:</label>
      <input
        id={addressFactoryId}
        value={addressFactory}
        onChange={(event) => {
          setAddressFactory(event.target.value as `0x${string}`);
        }}
        disabled={isFetching}
      />
      <span>ZorpFactory latest study index: {latest_study_index as string}</span>
    </>
  );
}
