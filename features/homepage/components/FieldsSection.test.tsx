/**
 * FieldsSection Component Tests
 * Validates Requirements: 11.4
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FieldsSection } from './FieldsSection';
import type { Field } from '@/lib/types/domain';

describe('FieldsSection', () => {
  const mockFields: Field[] = [
    {
      id: 'field-1',
      slug: 'plc',
      name: 'PLC Programming',
      description: 'Programmable Logic Controllers',
      icon: 'cpu',
      postCount: 45,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'field-2',
      slug: 'scada',
      name: 'SCADA Systems',
      description: 'Supervisory Control and Data Acquisition',
      icon: 'monitor',
      postCount: 32,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'field-3',
      slug: 'siemens',
      name: 'Siemens Automation',
      description: 'Siemens TIA Portal and S7 PLCs',
      icon: 'settings',
      postCount: 28,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('renders section heading', () => {
    render(<FieldsSection fields={mockFields} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Lĩnh vực' })).toBeInTheDocument();
  });

  it('renders section description', () => {
    render(<FieldsSection fields={mockFields} />);

    expect(screen.getByText('Khám phá các chủ đề tự động hóa công nghiệp')).toBeInTheDocument();
  });

  it('renders all fields', () => {
    render(<FieldsSection fields={mockFields} />);

    expect(screen.getByText('PLC Programming')).toBeInTheDocument();
    expect(screen.getByText('SCADA Systems')).toBeInTheDocument();
    expect(screen.getByText('Siemens Automation')).toBeInTheDocument();
  });

  it('renders field descriptions', () => {
    render(<FieldsSection fields={mockFields} />);

    expect(screen.getByText('Programmable Logic Controllers')).toBeInTheDocument();
    expect(screen.getByText('Supervisory Control and Data Acquisition')).toBeInTheDocument();
    expect(screen.getByText('Siemens TIA Portal and S7 PLCs')).toBeInTheDocument();
  });

  it('renders post counts for each field', () => {
    render(<FieldsSection fields={mockFields} />);

    expect(screen.getByText('45 danh mục')).toBeInTheDocument();
    expect(screen.getByText('32 danh mục')).toBeInTheDocument();
    expect(screen.getByText('28 danh mục')).toBeInTheDocument();
  });

  it('renders links to field pages', () => {
    render(<FieldsSection fields={mockFields} />);

    const plcLink = screen.getByRole('link', { name: /plc programming/i });
    expect(plcLink).toHaveAttribute('href', '/fields/plc');

    const scadaLink = screen.getByRole('link', { name: /scada systems/i });
    expect(scadaLink).toHaveAttribute('href', '/fields/scada');

    const siemensLink = screen.getByRole('link', { name: /siemens automation/i });
    expect(siemensLink).toHaveAttribute('href', '/fields/siemens');
  });

  it('renders nothing when no fields provided', () => {
    const { container } = render(<FieldsSection fields={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders field icons', () => {
    render(<FieldsSection fields={mockFields} />);

    // Each field card should have an icon (SVG)
    const svgs = screen
      .getAllByRole('link')
      .map((link) => link.querySelector('svg'))
      .filter(Boolean);

    expect(svgs.length).toBeGreaterThanOrEqual(3);
  });
});
