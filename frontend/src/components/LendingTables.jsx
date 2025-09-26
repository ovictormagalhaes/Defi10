import React from 'react';

import { useMaskValues } from '../context/MaskValuesContext';
import { useTheme } from '../context/ThemeProvider';
import { formatPrice, formatTokenAmount } from '../utils/walletUtils';

import TokenDisplay from './TokenDisplay';
import StandardHeader from './table/StandardHeader';

// Renders lending (Aave style) supplied, borrowed and rewards tokens using the same visual style as PoolTables (Uniswap)
export default function LendingTables({ supplied = [], borrowed = [], rewards = [] }) {
  const { theme } = useTheme();
  const { maskValue } = useMaskValues();
  const initialWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const [vw, setVw] = React.useState(initialWidth);
  React.useEffect(() => {
    const onResize = () => setVw(typeof window !== 'undefined' ? window.innerWidth : initialWidth);
    if (typeof window !== 'undefined') window.addEventListener('resize', onResize);
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('resize', onResize);
    };
  }, []);
  const hideAmount = vw < 600;
  if (
    (supplied?.length || 0) === 0 &&
    (borrowed?.length || 0) === 0 &&
    (rewards?.length || 0) === 0
  )
    return null;

  const Section = ({ title, tokens, negative }) => {
    if (!tokens || tokens.length === 0) return null;
    return (
      <div className="table-wrapper">
        <table className="table-unified text-primary">
          <StandardHeader
            columns={["price","amount","value"]}
            labels={{ token: title === 'Supplied' ? 'Supply' : title === 'Borrowed' ? 'Borrow' : 'Token' }}
          />
          <tbody>
            {tokens.map((t, idx) => {
              const valueRaw = parseFloat(t.totalPrice) || 0;
              const value = negative ? -Math.abs(valueRaw) : valueRaw;
              const unitPrice = parseFloat(t.priceUsd || t.priceUSD || t.price || 0) || 0;
              return (
                <tr
                  key={idx}
                  className={`table-row table-row-hover ${idx === tokens.length - 1 ? '' : 'tbody-divider'}`}
                >
                  <td className="td text-primary col-name">
                    <TokenDisplay tokens={[t]} size={22} showChain={false} />
                  </td>
                  <td className="td td-right td-mono text-primary col-price">
                    {maskValue(formatPrice(unitPrice))}
                  </td>
                  <td className="td td-right td-mono text-primary col-amount">
                    {maskValue(formatTokenAmount(t), { short: true })}
                  </td>
                  <td className="td td-right td-mono td-mono-strong text-primary col-value">{maskValue(formatPrice(value))}</td>
                </tr>
              );
            })}
            {tokens.length > 1 && (
              <tr className="table-summary">
                <td className="td text-primary col-name">Subtotal</td>
                <td className="td td-right td-mono text-primary col-price">-</td>
                <td className="td td-right td-mono text-primary col-amount">
                  {maskValue(formatTokenAmount({ amount: tokens.reduce((s, t) => s + (parseFloat(t.amount)||0), 0) }))}
                </td>
                <td className="td td-right td-mono td-mono-strong text-primary col-value">
                  {maskValue(formatPrice(tokens.reduce((s, t) => s + (parseFloat(t.totalPrice)||0), 0)))}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <Section title="Supplied" tokens={supplied} negative={false} />
      {supplied.length > 0 && borrowed.length > 0 && <div className="spacer-6" />}
      <Section title="Borrowed" tokens={borrowed} negative={true} />
      {(supplied.length > 0 || borrowed.length > 0) && rewards.length > 0 && (
        <div className="spacer-6" />
      )}
      <Section title="Rewards" tokens={rewards} negative={false} />
    </div>
  );
}
